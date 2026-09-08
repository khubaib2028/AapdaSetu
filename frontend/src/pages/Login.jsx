import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!password) {
      setMessage("Please enter the password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid password.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("aapdasetu_token", data.token);

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">🚨 AapdaSetu</div>

        <div className="nav-links">
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Home
          </button>
        </div>
      </nav>

      <section
        style={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "430px",
            padding: "35px",
            borderRadius: "16px",
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div style={{ fontSize: "45px" }}>🔐</div>

            <h1>Control Room Login</h1>

            <p style={{ color: "#64748b" }}>
              Authorized disaster-management personnel only
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Authority Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                marginBottom: "15px",
                boxSizing: "border-box",
                fontSize: "16px",
              }}
            />

            {message && (
              <p
                style={{
                  color: "#dc2626",
                  marginBottom: "15px",
                  fontWeight: "500",
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
              style={{
                width: "100%",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Authenticating..." : "🔓 Access Control Room"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;