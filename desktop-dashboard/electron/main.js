const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#000000',
    title: 'Thai Sty Crousty - Admin Dashboard',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Printer IPC Handlers
ipcMain.handle('get-printers', async () => {
  const win = new BrowserWindow({ show: false });
  const printers = await win.webContents.getPrintersAsync();
  win.close();
  return printers;
});

ipcMain.handle('print-receipt', async (event, htmlContent, printerName) => {
  return new Promise(async (resolve) => {
    let printWindow = null;
    let resolved = false;

    const cleanup = () => {
      if (printWindow && !printWindow.isDestroyed()) {
        try {
          printWindow.close();
          printWindow.destroy();
        } catch (e) {
          console.error('[MAIN_ELECTRON_PRINT_CLEANUP_ERR]:', e);
        }
      }
    };

    try {
      // 1. Hardware Pre-Flight Check: Verify printer exists and is online
      const tempWin = new BrowserWindow({ show: false });
      const systemPrinters = await tempWin.webContents.getPrintersAsync();
      tempWin.close();

      console.log('[PRINT_HARDWARE_CHECK]: Installed system printers count:', systemPrinters.length);

      let targetPrinter = null;
      if (printerName) {
        targetPrinter = systemPrinters.find(p => p.name.toLowerCase() === printerName.toLowerCase());
      } else {
        targetPrinter = systemPrinters.find(p => p.isDefault) || systemPrinters[0];
      }

      if (!targetPrinter) {
        console.warn(`[PRINT_HARDWARE_REJECT]: Selected printer "${printerName}" not found in OS system printers.`);
        resolve({ success: false, reason: 'PRINTER_NOT_FOUND' });
        return;
      }

      // Check OS printer status flags (status 128 = offline, 7 = offline in Windows)
      // Status flags: 0 = Ready/Idle, 128/7/512 = Offline/Error/Paper Jam
      if (targetPrinter.status && (targetPrinter.status === 128 || targetPrinter.status === 7 || targetPrinter.status === 512)) {
        console.warn(`[PRINT_HARDWARE_REJECT]: Printer "${targetPrinter.name}" is OFFLINE or IN ERROR (Status code: ${targetPrinter.status}).`);
        resolve({ success: false, reason: 'PRINTER_OFFLINE' });
        return;
      }

      // 2. Initialize Offscreen BrowserWindow for Printing
      printWindow = new BrowserWindow({ show: false });

      printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print({
          silent: true,
          printBackground: true,
          deviceName: targetPrinter.name,
        }, (success, failureReason) => {
          const logReason = success ? 'SUCCESS' : (failureReason || 'HARDWARE_REJECTED');
          console.log('[PRINT_RESULT]: Hardware print execution ->', success ? 'SUCCESS' : 'FAILED', `(${logReason})`);
          if (!resolved) {
            resolved = true;
            cleanup();
            if (success) {
              resolve({ success: true, printer: targetPrinter.name });
            } else {
              resolve({ success: false, reason: failureReason || 'SPOOLER_REJECTED' });
            }
          }
        });
      });

      // 3. Hardware Execution Timeout Safety (10s)
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn('[PRINT_TIMEOUT]: Printing job timed out after 10s.');
          cleanup();
          resolve({ success: false, reason: 'PRINT_TIMEOUT' });
        }
      }, 10000);
    } catch (err) {
      console.error('[PRINT_EXECUTION_CRASH]:', err);
      cleanup();
      resolve({ success: false, reason: err.message || 'PRINT_CRASH' });
    }
  });
});

// Helper: Build Real ESC/POS Binary Commands Buffer
function buildEscPosBuffer(orderData, paperWidth, openDrawer) {
  const buffers = [];
  const append = (buf) => buffers.push(Buffer.from(buf));
  const appendStr = (str, encoding = 'ascii') => buffers.push(Buffer.from(str, encoding));

  // Paper width determines column count: 80mm ≈ 48 chars, 58mm ≈ 32 chars at 12cpi
  const cols = paperWidth === '58mm' ? 32 : 48;
  const separator = '-'.repeat(cols) + '\n';

  // 1. Initialize Printer (ESC @)
  append([0x1B, 0x40]);

  // Optional: Open Cash Drawer Pulse (ESC p 0 25 250)
  if (openDrawer) {
    append([0x1B, 0x70, 0x00, 0x19, 0xFA]);
  }

  // Set Character Code Table to PC857 (Turkish) or CP866/PC437
  append([0x1B, 0x74, 0x0D]);

  // Center Align Header (ESC a 1)
  append([0x1B, 0x61, 0x01]);
  // Double Height & Width (GS ! 0x11)
  append([0x1D, 0x21, 0x11]);
  appendStr('THAI STY CROUSTY\n');
  
  // Normal Size (GS ! 0x00)
  append([0x1D, 0x21, 0x00]);
  appendStr('Restaurant & Fast Food\n');
  appendStr(separator);

  // Left Align Body (ESC a 0)
  append([0x1B, 0x61, 0x00]);
  appendStr(`Order: #${orderData.order_number || 'N/A'}\n`);
  appendStr(`Date : ${new Date(orderData.created_at || Date.now()).toLocaleString()}\n`);
  appendStr(`Client: ${orderData.name || 'Client POS'}\n`);
  appendStr(`Phone: ${orderData.phone || 'N/A'}\n`);
  appendStr(`Addr : ${orderData.address || 'Takeaway'}\n`);
  appendStr(separator);

  // Order Items — adapt column widths to paper size
  if (cols >= 48) {
    appendStr('QTY  ITEM                            PRICE\n');
  } else {
    appendStr('QTY  ITEM                PRICE\n');
  }
  appendStr(separator);

  if (Array.isArray(orderData.order_items)) {
    orderData.order_items.forEach((item) => {
      const qty = String(item.quantity || 1).padEnd(4);
      const nameMax = cols >= 48 ? 28 : 18;
      const namePad = cols >= 48 ? 29 : 19;
      const priceWidth = cols >= 48 ? 7 : 5;
      const name = String(item.product_name || 'Product').slice(0, nameMax).padEnd(namePad);
      const price = String(item.price || 0).padStart(priceWidth) + ' DA';
      appendStr(`${qty}${name}${price}\n`);
    });
  }

  appendStr(separator);

  // Right Align Total (ESC a 2)
  append([0x1B, 0x61, 0x02]);
  // Emphasized (ESC E 1)
  append([0x1B, 0x45, 0x01]);
  append([0x1D, 0x21, 0x01]); // Double height
  appendStr(`TOTAL: ${orderData.total || 0} DZD\n`);
  append([0x1D, 0x21, 0x00]);
  append([0x1B, 0x45, 0x00]);

  // Center Align Footer (ESC a 1)
  append([0x1B, 0x61, 0x01]);
  appendStr('\nThank you for your visit!\n');
  appendStr('Thai Sty Crousty - Algiers\n\n');

  // Feed 4 lines (ESC d 4)
  append([0x1B, 0x64, 0x04]);

  // Full Paper Cut (GS V 66 0)
  append([0x1D, 0x56, 0x42, 0x00]);

  return Buffer.concat(buffers);
}

// 1. Production ESC/POS Network Driver Handler (TCP Socket Port 9100)
ipcMain.handle('print-escpos-network', async (event, orderData, paperWidth, networkIP, openDrawer) => {
  const net = require('net');
  const targetHost = networkIP || '192.168.1.100';
  const targetPort = 9100;

  console.log(`[IPC_ESCPOS_NET]: Opening RAW TCP socket stream to ${targetHost}:${targetPort}...`);

  return new Promise((resolve) => {
    const client = new net.Socket();
    let handled = false;

    client.setTimeout(6000);

    client.connect(targetPort, targetHost, () => {
      console.log(`[IPC_ESCPOS_NET]: Socket connected to ${targetHost}:${targetPort}! Transmitting RAW binary buffer...`);
      const buffer = buildEscPosBuffer(orderData, paperWidth, openDrawer);
      
      client.write(buffer, () => {
        console.log(`[IPC_ESCPOS_NET]: Transmission successful! Closing socket.`);
        if (!handled) {
          handled = true;
          client.destroy();
          resolve({ success: true, printer: `Network Printer (${targetHost}:9100)` });
        }
      });
    });

    client.on('error', (err) => {
      console.error(`[IPC_ESCPOS_NET_ERR]: Connection error to ${targetHost}:${targetPort}:`, err.message);
      if (!handled) {
        handled = true;
        client.destroy();
        resolve({ success: false, reason: 'PRINTER_OFFLINE' });
      }
    });

    client.on('timeout', () => {
      console.warn(`[IPC_ESCPOS_NET_TIMEOUT]: Socket timed out connecting to ${targetHost}:${targetPort}.`);
      if (!handled) {
        handled = true;
        client.destroy();
        resolve({ success: false, reason: 'PRINT_TIMEOUT' });
      }
    });
  });
});

// 2. Production ESC/POS USB Driver Handler (RAW Thermal Printing)
// Uses the escpos-print library's Usb adapter for direct USB endpoint transfer.
// Fallback: if libusb/USB adapter fails, log the error clearly.
ipcMain.handle('print-escpos-raw', async (event, orderData, paperWidth, printerName, openDrawer) => {
  console.log(`[IPC_ESCPOS_RAW_USB]: Processing RAW ESC/POS USB job for target "${printerName || 'Default'}"...`);
  
  // Pre-flight OS check
  const tempWin = new BrowserWindow({ show: false });
  const systemPrinters = await tempWin.webContents.getPrintersAsync();
  tempWin.close();

  let targetPrinter = null;
  if (printerName) {
    targetPrinter = systemPrinters.find(p => p.name.toLowerCase() === printerName.toLowerCase());
  } else {
    targetPrinter = systemPrinters.find(p => p.isDefault) || systemPrinters[0];
  }

  if (!targetPrinter) {
    console.warn(`[IPC_ESCPOS_RAW_USB_REJECT]: Selected USB printer "${printerName}" not found.`);
    return { success: false, reason: 'PRINTER_NOT_FOUND' };
  }

  if (targetPrinter.status && (targetPrinter.status === 128 || targetPrinter.status === 7 || targetPrinter.status === 512)) {
    console.warn(`[IPC_ESCPOS_RAW_USB_REJECT]: USB Printer "${targetPrinter.name}" is OFFLINE (Status code: ${targetPrinter.status}).`);
    return { success: false, reason: 'PRINTER_OFFLINE' };
  }

  // Generate RAW ESC/POS Binary Buffer
  const buffer = buildEscPosBuffer(orderData, paperWidth, openDrawer);
  console.log(`[IPC_ESCPOS_RAW_USB]: RAW ESC/POS Buffer built (${buffer.length} bytes). Transmitting to USB printer "${targetPrinter.name}"...`);

  // Real USB transmission via escpos-print Printer + Usb adapter
  try {
    const { Printer, Adapters } = require('escpos-print');

    // Attempt auto-detection: find first USB printer device
    const usbAdapter = new Adapters.Usb();
    const printer = new Printer(usbAdapter);

    await printer.open();
    // Write the pre-built raw buffer directly to the USB endpoint
    usbAdapter.write(new Uint8Array(buffer));
    await printer.flush();
    await printer.close();

    console.log(`[IPC_ESCPOS_RAW_USB_SUCCESS]: RAW ESC/POS binary buffer (${buffer.length} bytes) successfully written to USB printer "${targetPrinter.name}".`);
    return { success: true, printer: targetPrinter.name };
  } catch (err) {
    console.error(`[IPC_ESCPOS_RAW_USB_FAIL]: USB adapter error for "${targetPrinter.name}":`, err.message || err);
    console.error(`[IPC_ESCPOS_RAW_USB_HINT]: If you see "No printer found" or "Cannot find module 'usb'", ensure:`);
    console.error(`  1. A USB thermal printer is physically connected`);
    console.error(`  2. The 'usb' native module is compiled for this Electron version (electron-rebuild)`);
    console.error(`  3. On Windows, the printer may need a WinUSB driver installed via Zadig`);
    console.error(`  Recommendation: Use ESC/POS Network (TCP:9100) for production — it is more reliable.`);
    return { success: false, reason: 'HARDWARE_REJECTED' };
  }
});

// 3. Cash Drawer IPC Handler (supports both Network and USB)
ipcMain.handle('kick-cash-drawer', async (event, printerName, networkIP) => {
  // Cash drawer pulse: ESC @ (init) + ESC p 0 25 250 (kick pin 2)
  const drawerPulse = Buffer.from([0x1B, 0x40, 0x1B, 0x70, 0x00, 0x19, 0xFA]);

  // Network path: send pulse via TCP socket
  if (networkIP) {
    const net = require('net');
    return new Promise((resolve) => {
      const client = new net.Socket();
      client.setTimeout(3000);
      client.connect(9100, networkIP, () => {
        client.write(drawerPulse, () => {
          console.log(`[IPC_CASH_DRAWER]: Network cash drawer pulse sent to ${networkIP}:9100.`);
          client.destroy();
          resolve(true);
        });
      });
      client.on('error', () => { client.destroy(); resolve(false); });
      client.on('timeout', () => { client.destroy(); resolve(false); });
    });
  }

  // USB path: send pulse via escpos-print Usb adapter
  try {
    const { Adapters } = require('escpos-print');
    const usbAdapter = new Adapters.Usb();
    await usbAdapter.open();
    await usbAdapter.write(new Uint8Array(drawerPulse));
    await usbAdapter.close();
    console.log(`[IPC_CASH_DRAWER]: USB cash drawer pulse sent via escpos-print.`);
    return true;
  } catch (err) {
    console.warn(`[IPC_CASH_DRAWER]: USB cash drawer failed:`, err.message || err);
    return false;
  }
});

// 4. Network Health Check IPC Handler (TCP connectivity test)
ipcMain.handle('health-check-network', async (event, networkIP) => {
  const net = require('net');
  const ip = networkIP || '192.168.1.100';

  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(2000);

    client.connect(9100, ip, () => {
      console.log(`[HEALTH_CHECK]: TCP connection to ${ip}:9100 successful — printer is ONLINE.`);
      client.destroy();
      resolve(true);
    });

    client.on('error', () => {
      console.log(`[HEALTH_CHECK]: TCP connection to ${ip}:9100 failed — printer is OFFLINE.`);
      client.destroy();
      resolve(false);
    });

    client.on('timeout', () => {
      console.log(`[HEALTH_CHECK]: TCP connection to ${ip}:9100 timed out — printer is OFFLINE.`);
      client.destroy();
      resolve(false);
    });
  });
});
