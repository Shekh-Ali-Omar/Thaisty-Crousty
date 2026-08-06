import React from 'react';
import { renderToString } from 'react-dom/server';
import { ReceiptTemplate } from '@/components/admin/ReceiptTemplate';
import type { IPrintDriver, PrintJobOptions, PrintResult, DriverCapabilities } from './IPrintDriver';

export class WindowsPrintDriver implements IPrintDriver {
  readonly name = 'Windows';
  readonly capabilities: DriverCapabilities = {
    supportsHardwareAck: false,
    supportsQueueMonitoring: true,
    supportsPaperStatus: false,
    supportsCashDrawer: false,
  };

  async print(options: PrintJobOptions): Promise<PrintResult> {
    const { order, printerName, paperWidth } = options;

    try {
      const html = renderToString(React.createElement(ReceiptTemplate, { order, paperWidth }));
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; }
              @media print {
                @page { margin: 0; size: ${paperWidth === '58mm' ? '58mm auto' : '80mm auto'}; }
              }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;

      if (typeof window !== 'undefined' && (window as any).electron?.printReceipt) {
        const result = await (window as any).electron.printReceipt(fullHtml, printerName);
        if (result.success) {
          return {
            success: true,
            statusOverride: 'queued',
            reason: 'QUEUED_IN_WINDOWS_SPOOLER',
            printerUsed: result.printer || printerName || 'Windows Print Spooler',
          };
        }
        return {
          success: false,
          statusOverride: 'failed',
          reason: result.reason,
          printerUsed: result.printer || printerName || 'Default OS Printer',
        };
      }

      return {
        success: false,
        reason: 'DRIVER_ERROR',
      };
    } catch (err: any) {
      console.error('[WINDOWS_DRIVER_ERR]:', err);
      return {
        success: false,
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
}
