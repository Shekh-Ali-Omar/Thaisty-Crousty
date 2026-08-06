import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PrinterBackendType = 'Windows' | 'EscPosUSB' | 'EscPosNetwork' | 'PDF';

interface SettingsState {
  selectedPrinter: string | null;
  printerType: PrinterBackendType;
  networkTargetIP: string;
  paperWidth: '58mm' | '80mm';
  autoPrintEnabled: boolean;
  retryQueueEnabled: boolean;
  setSelectedPrinter: (printer: string | null) => void;
  setPrinterType: (type: PrinterBackendType) => void;
  setNetworkTargetIP: (ip: string) => void;
  setPaperWidth: (width: '58mm' | '80mm') => void;
  setAutoPrintEnabled: (enabled: boolean) => void;
  setRetryQueueEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedPrinter: null,
      printerType: 'Windows',
      networkTargetIP: '192.168.1.100',
      paperWidth: '80mm',
      autoPrintEnabled: true,
      retryQueueEnabled: true,
      setSelectedPrinter: (printer) => set({ selectedPrinter: printer }),
      setPrinterType: (type) => set({ printerType: type }),
      setNetworkTargetIP: (ip) => set({ networkTargetIP: ip }),
      setPaperWidth: (width) => set({ paperWidth: width }),
      setAutoPrintEnabled: (enabled) => set({ autoPrintEnabled: enabled }),
      setRetryQueueEnabled: (enabled) => set({ retryQueueEnabled: enabled }),
    }),
    {
      name: 'thaisty-settings',
    }
  )
);
