import type { Order, OrderItem } from '@/lib/types';
import type { PrinterBackendType } from '@/store/settingsStore';

export interface DriverCapabilities {
  supportsHardwareAck: boolean;
  supportsQueueMonitoring: boolean;
  supportsPaperStatus: boolean;
  supportsCashDrawer: boolean;
}

export interface PrintJobOptions {
  order: Order & { order_items: OrderItem[] };
  printerName: string | null;
  networkTargetIP?: string;
  paperWidth: '58mm' | '80mm';
  openCashDrawer?: boolean;
}

export interface PrintResult {
  success: boolean;
  statusOverride?: 'queued' | 'printed' | 'failed';
  reason?: 'PRINTER_OFFLINE' | 'PRINTER_NOT_FOUND' | 'HARDWARE_REJECTED' | 'PRINT_TIMEOUT' | 'DRIVER_ERROR' | 'PDF_GENERATED' | 'QUEUED_IN_WINDOWS_SPOOLER' | 'HARDWARE_ACK_SUCCESS';
  printerUsed?: string;
}

export interface PrintHistoryEntry {
  attemptId: string;
  orderId: string;
  orderNumber: string;
  timestamp: string;
  driverName: PrinterBackendType;
  printerTarget: string;
  result: 'PRINTED' | 'QUEUED' | 'FAILED' | 'PDF_GENERATED';
  reason: string;
  durationMs: number;
}

export interface IPrintDriver {
  readonly name: PrinterBackendType;
  readonly capabilities: DriverCapabilities;
  print(options: PrintJobOptions): Promise<PrintResult>;
  verifyHardwareHealth(printerName: string | null): Promise<boolean>;
  kickCashDrawer?(printerName: string | null): Promise<boolean>;
}
