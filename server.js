const express = require("express")
const router = require("./src/routes")
const cors = require("cors")
const app = express()

require("dotenv").config()

app.use(express.json())
app.use(cors())

const http = require("http")
const { Server } = require("socket.io")

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
})
require("./src/socket")(io)

//endpoint routing
app.use("/api/v1/", router)
//routing for static file
app.use("/uploads", express.static("uploads"))

//port
let port = process.env.PORT
if (port == null || port == "") {
  port = 5000
}
server.listen(port, () => {
  console.log(`Server has started on port ${port}`)
})
