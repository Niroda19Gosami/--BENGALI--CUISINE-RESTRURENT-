// Reset role to avoid redirect loop
localStorage.removeItem("role");

document.getElementById("loginBtn").addEventListener("click", login);

function login() {
  const role = document.getElementById("role").value;
  const password = document.getElementById("password").value;

  if (role === "user" && password === "user123") {
    localStorage.setItem("role", "user");
    window.location.replace("index.html");
  }
  else if (role === "admin" && password === "admin123") {
    localStorage.setItem("role", "admin");
    window.location.replace("admin.html");
  }
  else {
    alert("Invalid credentials");
  }
}
