import React, { useState } from "react";

const C = {
  bg: "#0f172a",
  surface: "#111827",
  surface2: "#1f2937",
  border: "#334155",
  text: "#f8fafc",
  muted: "#94a3b8",
  accent: "#6366f1",
  purple: "#8b5cf6",
  red: "#ef4444",
};

export default function LoginPage({ dispatch }) {
  const [form, setForm] = useState({
    role: "student",
    id: "",
    pass: "",
  });

  const [err, setErr] = useState("");

  const inp = {
    width: "100%",
    padding: "12px 14px",
    background: C.surface2,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.text,
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
  };

  const handleLogin = () => {
    if (form.role === "student") {
      if (form.id === "S001" && form.pass === "pass123") {
        dispatch({
          type: "LOGIN",
          role: "student",
          user: {
            id: "S001",
            name: "Deepak",
            rollNo: "23CS001",
          },
        });
      } else {
        setErr("Invalid student credentials");
      }
    } else {
      if (form.id === "ADMIN" && form.pass === "admin123") {
        dispatch({
          type: "LOGIN",
          role: "admin",
          user: {
            id: "ADMIN",
            name: "Administrator",
          },
        });
      } else {
        setErr("Invalid admin credentials");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: 380,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: 30,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 18,
              margin: "0 auto 14px",
              background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
            }}
          >
            🎓
          </div>

          <h1 style={{ color: C.text, margin: 0 }}>AcademiX</h1>

          <p style={{ color: C.muted, marginTop: 6 }}>
            Student Management Portal
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            background: C.surface2,
            padding: 6,
            borderRadius: 10,
            marginBottom: 18,
          }}
        >
          {["student", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                background:
                  form.role === r
                    ? `linear-gradient(135deg, ${C.accent}, ${C.purple})`
                    : "transparent",
                color: "white",
                fontWeight: 600,
              }}
            >
              {r === "student" ? "Student" : "Admin"}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              color: C.muted,
              fontSize: 12,
              display: "block",
              marginBottom: 6,
            }}
          >
            {form.role === "student" ? "Student ID" : "Admin ID"}
          </label>

          <input
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            placeholder={form.role === "student" ? "S001" : "ADMIN"}
            style={inp}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              color: C.muted,
              fontSize: 12,
              display: "block",
              marginBottom: 6,
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={form.pass}
            onChange={(e) => setForm({ ...form, pass: e.target.value })}
            placeholder={form.role === "student" ? "pass123" : "admin123"}
            style={inp}
          />
        </div>

        {err && (
          <p
            style={{
              color: C.red,
              textAlign: "center",
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {err}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            color: "white",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}