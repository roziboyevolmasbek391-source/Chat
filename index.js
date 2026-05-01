import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import { createServer } from "http"
import { Server } from "socket.io"
import { readFile, writeFile } from "node:fs/promises"

const app = express()
const server = createServer(app)

const io = new Server(server, {
  cors: { origin: "*" }
})

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
app.use(express.static("./frontend"))

// ===== USERS =====
let users = {}

async function loadUsers() {
  try {
    const data = await readFile("./users.json", "utf-8")
    users = JSON.parse(data)
  } catch {
    users = {}
  }
}

async function saveUsers() {
  await writeFile("./users.json", JSON.stringify(users, null, 2))
}

await loadUsers()

// ===== REGISTER =====
app.post("/register", async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: "required" })
  }

  if (users[username]) {
    return res.status(409).json({ message: "User exists" })
  }

  const hash = await bcrypt.hash(password, 10)

  users[username] = { password: hash }

  await saveUsers()

  res.json({ ok: true })
})

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { username, password } = req.body

  const user = users[username]
  if (!user) {
    return res.status(401).json({ message: "not found" })
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    return res.status(401).json({ message: "wrong password" })
  }

  res.json({ ok: true, username })
})

// ===== SOCKET CHAT =====
let messages = []

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username

    socket.emit("chatHistory", messages)

    socket.broadcast.emit("message", {
      username: "System",
      text: `${username} joined`
    })
  })

  socket.on("sendMessage", (text) => {
    const msg = {
      username: socket.username,
      text
    }

    messages.push(msg)

    if (messages.length > 100) messages.shift()

    io.emit("message", msg)
  })

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("message", {
        username: "System",
        text: `${socket.username} left`
      })
    }
  })
})

server.listen(PORT, () => {
  console.log("Server running on http://localhost:3000")
})