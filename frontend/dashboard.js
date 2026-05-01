const user = JSON.parse(sessionStorage.getItem("user"))

if (!user) {
  window.location.href = "index.html"
}

document.getElementById("username").textContent = user.username

const chatBox = document.getElementById("chatBox")
const form = document.getElementById("chatForm")
const input = document.getElementById("messageInput")

async function loadMessages() {
  try {
    const res = await fetch("/api/messages")
    const messages = await res.json()
    chatBox.innerHTML = ""
    messages.forEach(m => addMessage(m))
    chatBox.scrollTop = chatBox.scrollHeight
  } catch (err) {
    console.error("Error loading messages:", err)
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault()

  if (!input.value.trim()) return

  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, text: input.value })
    })

    if (res.ok) {
      input.value = ""
      loadMessages()
    }
  } catch (err) {
    console.error("Error sending message:", err)
  }
})

function addMessage(msg) {
  const div = document.createElement("div")
  div.className = "message"
  div.innerHTML = `<b>${msg.username}:</b> ${msg.text}`
  chatBox.appendChild(div)
  chatBox.scrollTop = chatBox.scrollHeight
}

loadMessages()
setInterval(loadMessages, 1000)

document.getElementById("logout").onclick = () => {
  sessionStorage.removeItem("user")
  window.location.href = "index.html"
}
