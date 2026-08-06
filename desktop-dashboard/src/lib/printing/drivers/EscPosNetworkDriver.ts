import type { IPrintDriver, PrintJobOptions, PrintResult, DriverCapabilities } from './IPrintDriver';

export class EscPosNetworkDriver implements IPrintDriver {
  readonly name = 'EscPosNetwork';
  readonly capabilities: DriverCapabilities = {
    supportsHardwareAck: true,
    supportsQueueMonitoring: false,
    supportsPaperStatus: true,
    supportsCashDrawer: true,
  };

  async print(options: PrintJobOptions): Promise<PrintResult> {
    const { order, networkTargetIP, paperWidth, openCashDrawer } = options;
    const ip = networkTargetIP || '192.168.1.100';
    console.log(`[ESCPOS_NETWORK_DRIVER]: Transmitting RAW TCP Socket stream to ${ip}:9100 for Order ${order.order_number}...`);

    try {
      if (typeof window !== 'undefined' && (window as any).electron?.printEscPosNetwork) {
        const result = await (window as any).electron.printEscPosNetwork(order, paperWidth, ip, openCashDrawer ?? true);
        
        if (result.success) {
          return {
            success: true,
            statusOverride: 'printed', // Instant TCP Socket Hardware ACK
            reason: 'HARDWARE_ACK_SUCCESS',
            printerUsed: result.printer || `Network Thermal Printer (${ip}:9100)`,
          };
        }

        return {
          success: false,
          statusOverride: 'failed',
          reason: result.reason || 'PRINTER_OFFLINE',
          printerUsed: `Network Thermal Printer (${ip}:9100)`,
        };
      }

      return {
        success: false,
        statusOverride: 'failed',
        reason: 'DRIVER_ERROR',
      };
    } catch (err: any) {
      console.error('[ESCPOS_NETWORK_DRIVER_CRASH]:', err);
      return {
        success: false,
        statusOverride: 'failed',
        reason: 'DRIVER_ERROR',
      };
    }
  }

  async verifyHardwareHealth(networkTargetIP: string | null): Promise<boolean> {
    const ip = networkTargetIP || '192.168.1.100';
    console.log(`[ESCPOS_NETWORK]: Health check — attempting TCP connect to ${ip}:9100...`);

    try {
      if (typeof window === 'undefined' || !(window as any).electron?.healthCheckNetwork) {
        // Fallback: if IPC not available, assume online to avoid blocking
        return true;
      }
      const result = await (window as any).electron.healthCheckNetwork(ip);
      return result === true;
    } catch {
      return false;
    }
  }

  async kickCashDrawer(networkTargetIP: string | null): Promise<boolean> {
    const ip = networkTargetIP || '192.168.1.100';
    if (typeof window !== 'undefined' && (window as any).electron?.kickCashDrawer) {
      return await (window as any).electron.kickCashDrawer(null, ip);
    }
    return true;
  }
}
