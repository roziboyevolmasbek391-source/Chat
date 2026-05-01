const user = JSON.parse(sessionStorage.getItem("user"))

if(!user){
    window.location.href = "/index.html"
}