const email = `test${Date.now()}@example.com`;
const password = "password123";

fetch("https://hv-travel-api.vercel.app/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fullName: "Test User",
    email,
    password,
    rePassword: "password123",
    deviceId: "manual-test-device",
  })
})
  .then(res => res.json())
  .then(data => {
    if (data.status) {
      return fetch("https://hv-travel-api.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, deviceId: "manual-test-device" })
      }).then(r => r.json()).then(loginData => {
        const token = loginData.data.accessToken;
        return fetch("https://hv-travel-api.vercel.app/api/auth/me", {
          method: "GET",
          headers: { "Authorization": "Bearer " + token },
        }).then(r => r.json()).then(meData => {
          console.log("Me response:", JSON.stringify(meData, null, 2));
        });
      });
    }
  })
  .catch(console.error);
