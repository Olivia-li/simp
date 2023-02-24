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
  win.loadURL(process.env.URL || "localhost:3030/")

  win.on("minimize", function (event) {
    event.preventDefault()
    win.restore()
    win.setSize(320, 180)
  })
}

app.whenReady().then(() => {
  createWindow()
})
