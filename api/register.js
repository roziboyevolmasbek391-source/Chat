import bcrypt from "bcrypt"
import { readFile, writeFile } from "node:fs/promises"

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

  if (!username || !password) {
    return res.status(400).json({ message: "required" })
  }

  if (users[username]) {
    return res.status(409).json({ message: "User exists" })
  }

  const hash = await bcrypt.hash(password, 10)
  users[username] = { password: hash }

  await writeFile("./users.json", JSON.stringify(users, null, 2))

  res.json({ ok: true })
}
