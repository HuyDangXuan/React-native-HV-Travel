const email = "test1740929286403@example.com";
const password = "password123";

fetch("https://hv-travel-api.vercel.app/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
})
  .then(res => res.json())
  .then(data => {
    console.log("Login response:", JSON.stringify(data, null, 2));
  })
  .catch(console.error);
