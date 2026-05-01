import bcrypt from "bcrypt"
import { readFile } from "node:fs/promises"

let users = {}

async function loadUsers() {
  try {
    const data = await readFile("./users.json", "utf-8")
    users = JSON.parse(data)
  } catch {
    users = {}
  }
}

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  await loadUsers()

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
}
