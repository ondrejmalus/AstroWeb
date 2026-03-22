const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let adminSession = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  mainWindow.loadFile("frontend-admin/login.html");
}

ipcMain.handle("admin-login", async (_, credentials) => {
  try {
    const res = await fetch("https://astro-web.cz/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!data.success) {
      return { success: false, msg: data.msg };
    }

    if (data.role !== "admin") {
      return { success: false, msg: "Nemáš admin oprávnění" };
    }

    adminSession = {
      id: data.id,
      username: data.username,
      role: data.role,
    };

    return { success: true };

  } catch (err) {
    console.error(err);
    return { success: false, msg: "Chyba serveru" };
  }
});

ipcMain.handle("go-to", (_, page) => {
  if (!adminSession && page !== "login") return;
  mainWindow.loadFile(`frontend-admin/${page}.html`);
});

ipcMain.handle("logout", () => {
  adminSession = null;
  mainWindow.loadFile("frontend-admin/login.html");
});

ipcMain.handle("get-admin-session", () => {
  return adminSession;
});

app.whenReady().then(createWindow);