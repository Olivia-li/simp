require("./server.js")
const { app, BrowserWindow } = require("electron")

const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  win.loadURL("http://localhost:3000/")
  win.focus()
}

app.whenReady().then(() => {
  createWindow()
})
