require("./server.js")
const { app, BrowserWindow } = require("electron")

const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    minimizable: false,
    visibleOnFullScreen: true,
    titleBarStyle: "hidden",
    alwaysOnTop: true,
  })
  app.dock.hide()
  win.setAlwaysOnTop(true, "screen-saver", 1)
  win.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  })
  win.loadURL("http://localhost:3000/")
}

app.whenReady().then(() => {
  createWindow()
})
