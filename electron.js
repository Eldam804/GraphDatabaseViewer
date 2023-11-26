const { app, BrowserWindow, Menu, screen } = require('electron');
const path = require('path');

let win;
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: width,
    height: height,// Make the window unresizable
    //fullscreen: true,
    //resizable: false,
    frame: true, // Hide the default window frame
    titleBarStyle: 'hiddenInset', // Hide the title bar on macOS
    minimizable: true, 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  let appPath = app.getAppPath();

  let indexPath = path.join(__dirname, 'dist', 'graph-database-viewer', 'index.html');
  win.loadFile(indexPath).catch(e => console.error('Failed to load index.html:', e));
  Menu.setApplicationMenu(null);
  win.on('resize', () => {
    const { width, height } = win.getSize();
    // You can handle resize logic here if needed
  });

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('browser-window-focus', () => {
  if (win) {
    win.on('resize', () => {
      //win.webContents.reloadIgnoringCache();
    });
  }
});