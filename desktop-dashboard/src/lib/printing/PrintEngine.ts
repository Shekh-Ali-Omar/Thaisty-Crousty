import { supabase } from '../supabase';
import { useSettingsStore, PrinterBackendType } from '@/store/settingsStore';
import type { Order, OrderItem } from '@/lib/types';
import type { IPrintDriver, PrintResult, PrintHistoryEntry } from './drivers/IPrintDriver';
import { WindowsPrintDriver } from './drivers/WindowsPrintDriver';
import { EscPosUsbDriver } from './drivers/EscPosUsbDriver';
import { EscPosNetworkDriver } from './drivers/EscPosNetworkDriver';
import { PdfPrintDriver } from './drivers/PdfPrintDriver';

export class PrintEngine {
  private static instance: PrintEngine;
  private inFlightLocks = new Set<string>();
  private isProcessingQueue = false;
  private historyLog: PrintHistoryEntry[] = [];

  private drivers: Record<PrinterBackendType, IPrintDriver> = {
    Windows: new WindowsPrintDriver(),
    EscPosUSB: new EscPosUsbDriver(),
    EscPosNetwork: new EscPosNetworkDriver(),
    PDF: new PdfPrintDriver(),
  };

  private constructor() {}

  public static getInstance(): PrintEngine {
    if (!PrintEngine.instance) {
      PrintEngine.instance = new PrintEngine();
    }
    return PrintEngine.instance;
  }

  public getActiveDriver(): IPrintDriver {
    const { printerType } = useSettingsStore.getState();
    return this.drivers[printerType] || this.drivers.Windows;
  }

  public getPrintHistory(): PrintHistoryEntry[] {
    return [...this.historyLog];
  }

  /**
   * Category Printer Routing Hook (Future Multi-Printer Ready)
   * Resolves target printer name or destination based on item categories (Kitchen, Bar, POS)
   */
  public resolveCategoryPrinter(category: string, defaultPrinter: string | null): string | null {
    if (category === 'drink') return defaultPrinter; // Kitchen/Bar routing hook
    return defaultPrinter;
  }

  /**
   * Sole Mutator Method for Order Print Status Transitions & Print History Logging
   */
  public async submitPrintJob(order: Order & { order_items: OrderItem[] }): Promise<PrintResult> {
    if (this.inFlightLocks.has(order.id)) {
      console.log(`[PRINT_ENGINE]: Order ${order.order_number} is already in-flight.`);
      return { success: false, reason: 'DRIVER_ERROR' };
    }

    this.inFlightLocks.add(order.id);
    const startTime = Date.now();

    try {
      const { selectedPrinter, paperWidth, networkTargetIP } = useSettingsStore.getState();
      console.log(`[PRINT_ENGINE]: [pending -> printing] Lock claimed for Order ${order.order_number}...`);

      // 1. Transition DB state to 'printing'
      const { error: lockErr } = await supabase
        .from('orders')
        .update({ print_status: 'printing' })
        .eq('id', order.id);

      if (lockErr) {
        console.error(`[PRINT_ENGINE]: Lock update error for ${order.order_number}:`, lockErr.message);
      }

      // 2. Delegate to active hardware driver Strategy
      const driver = this.getActiveDriver();
      console.log(`[PRINT_ENGINE]: Executing via driver strategy "${driver.name}" (Capabilities: HW_ACK=${driver.capabilities.supportsHardwareAck}) for ${order.order_number}...`);
      
      const result = await driver.print({
        order,
        printerName: selectedPrinter,
        networkTargetIP,
        paperWidth,
        openCashDrawer: true,
      });

      const durationMs = Date.now() - startTime;

      if (result.success) {
        // Evaluate driver status override ('queued' for Windows vs 'printed' for ESC/POS hardware ACK)
        const targetStatus = result.statusOverride || (driver.capabilities.supportsHardwareAck ? 'printed' : 'queued');
        console.log(`[PRINT_ENGINE]: Updating ${order.order_number} -> ${targetStatus}`);
        
        const updateData: any = {
          print_status: targetStatus,
        };
        if (targetStatus === 'printed') {
          updateData.printed_at = new Date().toISOString();
        } else if (targetStatus === 'queued' || targetStatus === 'failed') {
          updateData.printed_at = null;
        }

        const { error: updateErr } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', order.id);

        if (updateErr) {
          console.error(`[PRINT_ENGINE]: Supabase update failed (${order.order_number}):`, updateErr.message);
        } else {
          console.log(`[PRINT_ENGINE]: Supabase update successful (${order.order_number} -> ${targetStatus})`);
        }

        // Log to Print History
        this.addHistoryEntry({
          attemptId: 'att-' + Date.now(),
          orderId: order.id,
          orderNumber: order.order_number,
          timestamp: new Date().toISOString(),
          driverName: driver.name,
          printerTarget: result.printerUsed || selectedPrinter || 'Default Printer',
          result: targetStatus === 'printed' ? 'PRINTED' : 'QUEUED',
          reason: result.reason || 'SUCCESS',
          durationMs,
        });

        return result;
      } else {
        // 4. HARDWARE / SPOOLER FAILURE: Transition to 'failed'
        console.log(`[PRINT_ENGINE]: Updating order ${order.order_number} -> failed`);
        const { error: updateErr } = await supabase
          .from('orders')
          .update({
            print_status: 'failed',
            printed_at: null,
          })
          .eq('id', order.id);

        if (updateErr) {
          console.error(`[PRINT_ENGINE]: Supabase update failed: ${updateErr.message}`);
        } else {
          console.log(`[PRINT_ENGINE]: Supabase update successful (${order.order_number} -> failed)`);
        }

        // Log to Print History
        this.addHistoryEntry({
          attemptId: 'att-' + Date.now(),
          orderId: order.id,
          orderNumber: order.order_number,
          timestamp: new Date().toISOString(),
          driverName: driver.name,
          printerTarget: selectedPrinter || 'Default Printer',
          result: 'FAILED',
          reason: result.reason || 'HARDWARE_REJECTED',
          durationMs,
        });

        return result;
      }
    } catch (err: any) {
      console.error(`[PRINT_ENGINE_CRASH]: Execution crashed for order ${order.order_number}:`, err);
      
      await supabase
        .from('orders')
        .update({
          print_status: 'failed',
          printed_at: null,
        })
        .eq('id', order.id);

      this.addHistoryEntry({
        attemptId: 'att-' + Date.now(),
        orderId: order.id,
        orderNumber: order.order_number,
        timestamp: new Date().toISOString(),
        driverName: this.getActiveDriver().name,
        printerTarget: 'Unknown',
        result: 'FAILED',
        reason: err.message || 'DRIVER_ERROR',
        durationMs: Date.now() - startTime,
      });

      return { success: false, reason: 'DRIVER_ERROR' };
    } finally {
      this.inFlightLocks.delete(order.id);
    }
  }

  private addHistoryEntry(entry: PrintHistoryEntry) {
    this.historyLog.unshift(entry);
    if (this.historyLog.length > 50) {
      this.historyLog.pop();
    }
  }

  /**
   * Process Retry Queue & Spooler Queue Monitor for Pending, Queued, or Failed Orders
   */
  public async processRetryQueue(): Promise<void> {
    const { retryQueueEnabled } = useSettingsStore.getState();
    if (!retryQueueEnabled || this.isProcessingQueue) return;

    this.isProcessingQueue = true;

    try {
      const restaurantId = import.meta.env.VITE_RESTAURANT_ID;

      // 1. Queue Monitor: Check if printer is online to resolve 'queued' jobs to 'printed'
      const driver = this.getActiveDriver();
      const { selectedPrinter, networkTargetIP, printerType } = useSettingsStore.getState();
      // Pass the correct identifier: networkTargetIP for network drivers, selectedPrinter for others
      const healthCheckTarget = printerType === 'EscPosNetwork' ? networkTargetIP : selectedPrinter;
      const isHealthy = await driver.verifyHardwareHealth(healthCheckTarget);

      if (isHealthy) {
        const { data: queuedOrders } = await supabase
          .from('orders')
          .select('id, order_number')
          .eq('restaurant_id', restaurantId)
          .eq('print_status', 'queued');

        if (queuedOrders && queuedOrders.length > 0) {
          console.log(`[QUEUE_MONITOR]: Hardware is online! Transitioning ${queuedOrders.length} queued orders to 'printed'...`);
          for (const qOrder of queuedOrders) {
            await supabase
              .from('orders')
              .update({
                print_status: 'printed',
                printed_at: new Date().toISOString(),
              })
              .eq('id', qOrder.id);
            console.log(`[QUEUE_MONITOR]: Order ${qOrder.order_number} -> printed`);
          }
        }
      }

      // 2. Retry Queue: Process pending or failed orders
      const { data: queueOrders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('restaurant_id', restaurantId)
        .in('print_status', ['failed', 'pending'])
        .order('created_at', { ascending: true });

      if (queueOrders && queueOrders.length > 0) {
        console.log(`[PRINT_ENGINE]: Processing ${queueOrders.length} queue jobs...`);
        for (const orderRow of queueOrders) {
          const res = await this.submitPrintJob(orderRow as any);
          if (!res.success) {
            console.warn(`[PRINT_ENGINE]: Pausing retry queue iteration as hardware is unreachable.`);
            break;
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }
}
