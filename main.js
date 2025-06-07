const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'path-to-icon', 'icon.ico'), // Replace 'path-to-icon/icon.ico' with actual path
    webPreferences: {
      nodeIntegration: true,        // Allow Node.js features
      contextIsolation: false,      // Allow renderer and preload to share context
    }
  });

  // Load the homepage HTML
  win.loadFile(path.join(__dirname, 'uthentication', 'html', 'homepage.html'));

  // Optional: Open DevTools in development
  // win.webContents.openDevTools();
}

// Run when Electron is ready
app.whenReady().then(createWindow);

// On all windows closed
app.on('window-all-closed', () => {
  // On macOS, apps stay active until Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS: recreate window on dock icon click if no windows are open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
