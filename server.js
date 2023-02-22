const express = require("express")
const app = express()
const server = require("http").Server(app)

app.use(express.static("public"))
app.set("view engine", "ejs")

app.get("/", (req, res) => {
  res.render("room")
})

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room })
})

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit("user-connected", userId)
  })
})
server.listen(3030)
