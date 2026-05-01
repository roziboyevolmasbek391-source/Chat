const user = JSON.parse(sessionStorage.getItem("user"))

if (!user) {
  window.location.href = "index.html"
}

document.getElementById("username").textContent = user.username

const socket = io("http://localhost:3000")

socket.emit("join", user.username)

const chatBox = document.getElementById("chatBox")
const form = document.getElementById("chatForm")
const input = document.getElementById("messageInput")

socket.on("chatHistory", (msgs) => {
  msgs.forEach(m => addMessage(m))
})

socket.on("message", (msg) => {
  addMessage(msg)
})

form.addEventListener("submit", (e) => {
  e.preventDefault()

  if (input.value.trim()) {
    socket.emit("sendMessage", input.value)
    input.value = ""
  }
})

function addMessage(msg) {
  const div = document.createElement("div")
  div.className = "message"
  div.innerHTML = `<b>${msg.username}:</b> ${msg.text}`
  chatBox.appendChild(div)
  chatBox.scrollTop = chatBox.scrollHeight
}

document.getElementById("logout").onclick = () => {
  sessionStorage.removeItem("user")
  window.location.href = "index.html"
}