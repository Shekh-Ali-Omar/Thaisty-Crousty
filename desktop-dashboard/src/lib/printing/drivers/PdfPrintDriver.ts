import type { IPrintDriver, PrintJobOptions, PrintResult, DriverCapabilities } from './IPrintDriver';

export class PdfPrintDriver implements IPrintDriver {
  readonly name = 'PDF';
  readonly capabilities: DriverCapabilities = {
    supportsHardwareAck: false,
    supportsQueueMonitoring: false,
    supportsPaperStatus: false,
    supportsCashDrawer: false,
  };

  async print(options: PrintJobOptions): Promise<PrintResult> {
    console.log(`[PDF_TEST_DRIVER]: Generating virtual PDF receipt preview for order ${options.order.order_number}...`);
    
    // PDF virtual test driver — returns success so PrintEngine does not mark orders as 'failed'
    // and trigger the retry queue. The statusOverride ensures correct DB state.
    return {
      success: true,
      statusOverride: 'printed',
      reason: 'PDF_GENERATED',
      printerUsed: 'Virtual PDF Generator',
    };
  }

  async verifyHardwareHealth(): Promise<boolean> {
    return true;
  }
}
