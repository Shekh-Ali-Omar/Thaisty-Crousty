import type { IPrintDriver, PrintJobOptions, PrintResult, DriverCapabilities } from './IPrintDriver';

export class EscPosUsbDriver implements IPrintDriver {
  readonly name = 'EscPosUSB';
  readonly capabilities: DriverCapabilities = {
    supportsHardwareAck: true,
    supportsQueueMonitoring: false,
    supportsPaperStatus: true,
    supportsCashDrawer: true,
  };

  async print(options: PrintJobOptions): Promise<PrintResult> {
    const { order, printerName, paperWidth, openCashDrawer } = options;
    console.log(`[ESCPOS_USB_DRIVER]: Invoking RAW ESC/POS USB binary transmission for Order ${order.order_number}...`);

    try {
      if (typeof window !== 'undefined' && (window as any).electron?.printEscPosRaw) {
        const result = await (window as any).electron.printEscPosRaw(order, paperWidth, printerName, openCashDrawer ?? true);
        
        if (result.success) {
          return {
            success: true,
            statusOverride: 'printed', // Instant hardware ACK confirmation
            reason: 'HARDWARE_ACK_SUCCESS',
            printerUsed: result.printer || printerName || 'USB ESC/POS Thermal Printer',
          };
        }

        return {
          success: false,
          statusOverride: 'failed',
          reason: result.reason || 'HARDWARE_REJECTED',
          printerUsed: printerName || 'USB ESC/POS Thermal Printer',
        };
      }

      return {
        success: false,
        statusOverride: 'failed',
        reason: 'DRIVER_ERROR',
      };
    } catch (err: any) {
      console.error('[ESCPOS_USB_DRIVER_CRASH]:', err);
      return {
        success: false,
        statusOverride: 'failed',
        reason: 'DRIVER_ERROR',
      };
    }
  }

  async verifyHardwareHealth(printerName: string | null): Promise<boolean> {
    if (typeof window === 'undefined' || !(window as any).electron?.getPrinters) {
      return false;
    }
    try {
      const printers = await (window as any).electron.getPrinters();
      if (!Array.isArray(printers) || printers.length === 0) return false;

      let target = null;
      if (printerName) {
        target = printers.find((p: any) => p.name?.toLowerCase() === printerName.toLowerCase());
      } else {
        target = printers.find((p: any) => p.isDefault) || printers[0];
      }

      if (!target) return false;
      return !(target.status === 128 || target.status === 7 || target.status === 512);
    } catch {
      return false;
    }
  }

  async kickCashDrawer(printerName: string | null): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).electron?.kickCashDrawer) {
      return await (window as any).electron.kickCashDrawer(printerName, null);
    }
    return true;
  }
}
