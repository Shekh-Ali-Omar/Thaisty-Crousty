const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printReceipt: (htmlContent, printerName) => ipcRenderer.invoke('print-receipt', htmlContent, printerName),
  printEscPosRaw: (orderData, paperWidth, printerName, openDrawer) => ipcRenderer.invoke('print-escpos-raw', orderData, paperWidth, printerName, openDrawer),
  printEscPosNetwork: (orderData, paperWidth, networkIP, openDrawer) => ipcRenderer.invoke('print-escpos-network', orderData, paperWidth, networkIP, openDrawer),
  kickCashDrawer: (printerName, networkIP) => ipcRenderer.invoke('kick-cash-drawer', printerName, networkIP),
  healthCheckNetwork: (networkIP) => ipcRenderer.invoke('health-check-network', networkIP),
});
