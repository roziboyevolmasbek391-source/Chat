sessionStorage.removeItem("user")
document.getElementById("registerForm").reset()

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })

  const data = await res.json()

  if (res.ok) {
    alert("Registered ✅")
    window.location.href = "index.html"
  } else {
    alert(data.message)
  }
})