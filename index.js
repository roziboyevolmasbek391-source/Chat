import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import { readFile, writeFile } from "node:fs/promises"

const app = express()

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

// ===== CHAT HISTORY =====
let messages = []

app.get("/api/messages", (req, res) => {
  res.json(messages)
})

app.post("/api/messages", (req, res) => {
  const { username, text } = req.body

  if (!username || !text) {
    return res.status(400).json({ message: "required" })
  }

  const msg = { username, text, timestamp: new Date().toISOString() }
  messages.push(msg)

  if (messages.length > 100) messages.shift()

  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT)
})
