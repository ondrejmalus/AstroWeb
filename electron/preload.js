const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("adminAPI", {

  login: (credentials) =>
    ipcRenderer.invoke("admin-login", credentials),

  goTo: (page) =>
    ipcRenderer.invoke("go-to", page),

  logout: () =>
    ipcRenderer.invoke("logout"),

  getSession: () =>
    ipcRenderer.invoke("get-admin-session")

});