const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (!app.isPackaged) {
    win.loadFile("frontend-admin/login.html");
  }
}

app.whenReady().then(createWindow);