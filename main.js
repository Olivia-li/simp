require("./server.js")
const { app, BrowserWindow } = require("electron")

const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    minimizable: true,
    visibleOnFullScreen: true,
    titleBarStyle: "hidden",
    alwaysOnTop: true,
  })

  app.dock.hide()
  win.setAlwaysOnTop(true, "screen-saver", 1)
  win.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  })
  win.loadURL(process.env.URL || "http://localhost:3000/")

  win.on("minimize", function (event) {
    event.preventDefault()
    win.restore()
    win.setSize(160, 90)
  })
}

app.whenReady().then(() => {
  createWindow()
})
