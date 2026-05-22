import React from "react";

const C = {
  bg: "#0f172a",
  surface: "#111827",
  border: "#334155",
  text: "#f8fafc",
  muted: "#94a3b8",
  accent: "#6366f1",
  purple: "#8b5cf6",
};

export default function HomePage({ user, role, dispatch }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>🎓 AcademiX</h2>

          <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13 }}>
            {role === "admin" ? "Admin Portal" : "Student Portal"}
          </p>
        </div>

        <button
          onClick={() => dispatch({ type: "LOGOUT" })}
          style={{
            padding: "10px 18px",
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            background: "transparent",
            color: C.text,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            marginBottom: 24,
          }}
        >
          👋
        </div>

        <h1 style={{ margin: 0, fontSize: 40 }}>
          Welcome, {user.name}
        </h1>

        <p
          style={{
            marginTop: 12,
            color: C.muted,
            maxWidth: 600,
            lineHeight: 1.7,
            fontSize: 15,
          }}
        >
          This is a simple home page with login and logout functionality.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 30,
          }}
        >
          {[
            "Dashboard",
            "Marks",
            "Attendance",
            "Profile",
          ].map((btn) => (
            <button
              key={btn}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: 12,
                background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
                minWidth: 140,
              }}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}