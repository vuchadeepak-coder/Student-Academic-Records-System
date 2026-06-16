import { useState, useReducer } from "react";

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0e1a", surface: "#111827", surface2: "#1a2234", border: "#1e2d47",
  accent: "#3b82f6", accentL: "#60a5fa", gold: "#f59e0b", green: "#10b981",
  red: "#ef4444", orange: "#f97316", purple: "#8b5cf6",
  text: "#f1f5f9", muted: "#64748b", soft: "#94a3b8",
};

// ─── GRADE / CGPA HELPERS ─────────────────────────────────────────────────────
function gradeFromMarks(m, mx = 100) {
  const p = (m / mx) * 100;
  if (p >= 90) return { l: "O", gp: 10 };
  if (p >= 80) return { l: "A+", gp: 9 };
  if (p >= 70) return { l: "A", gp: 8 };
  if (p >= 60) return { l: "B+", gp: 7 };
  if (p >= 50) return { l: "B", gp: 6 };
  if (p >= 40) return { l: "C", gp: 5 };
  return { l: "F", gp: 0 };
}
function calcSGPA(subs) {
  let cp = 0, c = 0;
  subs.forEach(s => { const { gp } = gradeFromMarks(s.marks, s.maxMarks); cp += gp * s.credits; c += s.credits; });
  return c ? (cp / c).toFixed(2) : "0.00";
}
function calcCGPA(sems) {
  if (!sems.length) return "0.00";
  const s = sems.map(s => parseFloat(calcSGPA(s.subjects)));
  return (s.reduce((a, b) => a + b, 0) / s.length).toFixed(2);
}
function getBL(st) {
  const bl = [];
  st.semesters.forEach(sem => sem.subjects.forEach(sub => {
    if (gradeFromMarks(sub.marks, sub.maxMarks).l === "F") bl.push({ ...sub, sem: sem.sem });
  }));
  return bl;
}
function gColor(l) {
  if (l === "O") return C.gold; if (l === "A+") return "#34d399"; if (l === "A") return C.green;
  if (l === "B+") return C.accentL; if (l === "B") return C.accent; if (l === "C") return C.orange;
  return C.red;
}
function attColor(p) { return p >= 75 ? C.green : p >= 60 ? C.gold : C.red; }

// ─── TIMETABLE DATA ───────────────────────────────────────────────────────────
const TIMETABLE = [
  { day: "Monday",    slots: [{ time: "9-10",  sub: "Algorithms",        code: "CS301" }, { time: "10-11", sub: "OS Concepts",         code: "CS302" }, { time: "11-12", sub: "Break",          code: null }, { time: "12-1",  sub: "Database Systems",    code: "CS304" }, { time: "2-3",   sub: "Computer Networks",   code: "CS303" }, { time: "3-4",   sub: "Lab",             code: null }] },
  { day: "Tuesday",   slots: [{ time: "9-10",  sub: "Computer Networks", code: "CS303" }, { time: "10-11", sub: "Algorithms",         code: "CS301" }, { time: "11-12", sub: "Break",          code: null }, { time: "12-1",  sub: "OS Concepts",         code: "CS302" }, { time: "2-3",   sub: "Database Systems",    code: "CS304" }, { time: "3-4",   sub: "Sports",          code: null }] },
  { day: "Wednesday", slots: [{ time: "9-10",  sub: "Database Systems",  code: "CS304" }, { time: "10-11", sub: "Computer Networks",  code: "CS303" }, { time: "11-12", sub: "Break",          code: null }, { time: "12-1",  sub: "Algorithms",         code: "CS301" }, { time: "2-3",   sub: "Lab",                code: null    }, { time: "3-4",   sub: "Lab",             code: null }] },
  { day: "Thursday",  slots: [{ time: "9-10",  sub: "OS Concepts",       code: "CS302" }, { time: "10-11", sub: "Database Systems",  code: "CS304" }, { time: "11-12", sub: "Break",          code: null }, { time: "12-1",  sub: "Computer Networks",   code: "CS303" }, { time: "2-3",   sub: "Algorithms",         code: "CS301" }, { time: "3-4",   sub: "Activity",        code: null }] },
  { day: "Friday",    slots: [{ time: "9-10",  sub: "Algorithms",        code: "CS301" }, { time: "10-11", sub: "OS Concepts",         code: "CS302" }, { time: "11-12", sub: "Break",          code: null }, { time: "12-1",  sub: "Lab",                code: null    }, { time: "2-3",   sub: "Database Systems",    code: "CS304" }, { time: "3-4",   sub: "Computer Networks", code: "CS303" }] },
];

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const initState = {
  currentUser: null, role: null,
  students: [
    {
      id: "S001", name: "Deepak Reddy", rollNo: "CS21001", branch: "CSE", year: 3,
      email: "deepak.reddy@college.edu", phone: "9876543210", dob: "2003-04-12", avatar: "DR",
      attendance: [
        { sem: 1, subjects: [{ code: "MA101", name: "Engineering Maths", total: 60, present: 54 }, { code: "PH101", name: "Physics", total: 55, present: 44 }, { code: "CS101", name: "C Programming", total: 58, present: 56 }, { code: "EC101", name: "Basic Electronics", total: 50, present: 38 }] },
        { sem: 2, subjects: [{ code: "CS201", name: "Data Structures", total: 62, present: 57 }, { code: "MA201", name: "Discrete Maths", total: 60, present: 48 }, { code: "EC201", name: "Digital Logic", total: 55, present: 45 }, { code: "CS202", name: "OOP with Java", total: 65, present: 62 }] },
        { sem: 3, subjects: [{ code: "CS301", name: "Algorithms", total: 58, present: 38 }, { code: "CS302", name: "OS Concepts", total: 60, present: 52 }, { code: "CS303", name: "Computer Networks", total: 55, present: 48 }, { code: "CS304", name: "Database Systems", total: 62, present: 58 }] },
      ],
      semesters: [
        { sem: 1, subjects: [{ name: "Engineering Maths", code: "MA101", maxMarks: 100, marks: 88, credits: 4 }, { name: "Physics", code: "PH101", maxMarks: 100, marks: 72, credits: 3 }, { name: "C Programming", code: "CS101", maxMarks: 100, marks: 91, credits: 4 }, { name: "Basic Electronics", code: "EC101", maxMarks: 100, marks: 65, credits: 3 }] },
        { sem: 2, subjects: [{ name: "Data Structures", code: "CS201", maxMarks: 100, marks: 84, credits: 4 }, { name: "Discrete Maths", code: "MA201", maxMarks: 100, marks: 78, credits: 4 }, { name: "Digital Logic", code: "EC201", maxMarks: 100, marks: 70, credits: 3 }, { name: "OOP with Java", code: "CS202", maxMarks: 100, marks: 92, credits: 4 }] },
        { sem: 3, subjects: [{ name: "Algorithms", code: "CS301", maxMarks: 100, marks: 55, credits: 4 }, { name: "OS Concepts", code: "CS302", maxMarks: 100, marks: 68, credits: 4 }, { name: "Computer Networks", code: "CS303", maxMarks: 100, marks: 74, credits: 3 }, { name: "Database Systems", code: "CS304", maxMarks: 100, marks: 82, credits: 4 }] },
      ]
    },
    {
      id: "S002", name: "Rajan Mehta", rollNo: "CS21002", branch: "CSE", year: 3,
      email: "rajan@college.edu", phone: "9876500001", dob: "2003-07-22", avatar: "RM",
      attendance: [
        { sem: 3, subjects: [{ code: "CS301", name: "Algorithms", total: 58, present: 50 }, { code: "CS302", name: "OS Concepts", total: 60, present: 55 }, { code: "CS303", name: "Computer Networks", total: 55, present: 40 }, { code: "CS304", name: "Database Systems", total: 62, present: 44 }] },
      ],
      semesters: [
        { sem: 1, subjects: [{ name: "Engineering Maths", code: "MA101", maxMarks: 100, marks: 62, credits: 4 }, { name: "Physics", code: "PH101", maxMarks: 100, marks: 45, credits: 3 }, { name: "C Programming", code: "CS101", maxMarks: 100, marks: 78, credits: 4 }, { name: "Basic Electronics", code: "EC101", maxMarks: 100, marks: 58, credits: 3 }] },
        { sem: 2, subjects: [{ name: "Data Structures", code: "CS201", maxMarks: 100, marks: 70, credits: 4 }, { name: "Discrete Maths", code: "MA201", maxMarks: 100, marks: 38, credits: 4 }, { name: "Digital Logic", code: "EC201", maxMarks: 100, marks: 66, credits: 3 }, { name: "OOP with Java", code: "CS202", maxMarks: 100, marks: 80, credits: 4 }] },
        { sem: 3, subjects: [{ name: "Algorithms", code: "CS301", maxMarks: 100, marks: 72, credits: 4 }, { name: "OS Concepts", code: "CS302", maxMarks: 100, marks: 61, credits: 4 }, { name: "Computer Networks", code: "CS303", maxMarks: 100, marks: 55, credits: 3 }, { name: "Database Systems", code: "CS304", maxMarks: 100, marks: 49, credits: 4 }] },
      ]
    },
    {
      id: "S003", name: "Priya Nair", rollNo: "EC21001", branch: "ECE", year: 3,
      email: "priya@college.edu", phone: "9123456789", dob: "2003-01-05", avatar: "PN",
      attendance: [
        { sem: 3, subjects: [{ code: "EC301", name: "Digital Comm", total: 58, present: 56 }, { code: "EC302", name: "VLSI Design", total: 60, present: 58 }, { code: "EC303", name: "Microprocessors", total: 55, present: 54 }, { code: "EC304", name: "Control Systems", total: 62, present: 60 }] },
      ],
      semesters: [
        { sem: 1, subjects: [{ name: "Engineering Maths", code: "MA101", maxMarks: 100, marks: 95, credits: 4 }, { name: "Physics", code: "PH101", maxMarks: 100, marks: 89, credits: 3 }, { name: "C Programming", code: "CS101", maxMarks: 100, marks: 76, credits: 4 }, { name: "Basic Electronics", code: "EC101", maxMarks: 100, marks: 92, credits: 3 }] },
        { sem: 2, subjects: [{ name: "Signals & Systems", code: "EC201", maxMarks: 100, marks: 88, credits: 4 }, { name: "Network Theory", code: "EC202", maxMarks: 100, marks: 91, credits: 4 }, { name: "EMT", code: "EC203", maxMarks: 100, marks: 84, credits: 3 }, { name: "Analog Electronics", code: "EC204", maxMarks: 100, marks: 78, credits: 4 }] },
        { sem: 3, subjects: [{ name: "Digital Comm", code: "EC301", maxMarks: 100, marks: 86, credits: 4 }, { name: "VLSI Design", code: "EC302", maxMarks: 100, marks: 79, credits: 4 }, { name: "Microprocessors", code: "EC303", maxMarks: 100, marks: 90, credits: 3 }, { name: "Control Systems", code: "EC304", maxMarks: 100, marks: 83, credits: 4 }] },
      ]
    },
  ],
  revRequests: [
    { id: "RV001", studentId: "S001", studentName: "Deepak Reddy", subject: "Algorithms", code: "CS301", sem: 3, currentMarks: 55, reason: "My derivation in Q3 is valid and deserves full credit.", status: "pending", date: "2026-05-01" },
    { id: "RV002", studentId: "S002", studentName: "Rajan Mehta", subject: "Discrete Maths", code: "MA201", sem: 2, currentMarks: 38, reason: "The proof for Q5 should have received full credit.", status: "approved", date: "2026-04-20", newMarks: 52 },
  ],
  notifications: [
    { id: "N1", userId: "S001", title: "Re-valuation Update", message: "Your request for Algorithms (CS301) has been received.", type: "info", read: false, date: "2026-05-01" },
    { id: "N3", userId: "S001", title: "Attendance Alert", message: "Your Algorithms attendance is below 75%. Please attend more classes.", type: "warning", read: false, date: "2026-04-15" },
    { id: "N2", userId: "S002", title: "Re-valuation Approved", message: "Your Discrete Maths re-valuation is approved. Marks updated to 52.", type: "success", read: false, date: "2026-04-22" },
  ],
  activeTab: "dashboard",
};

// ─── REDUCER ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "LOGIN": return { ...state, currentUser: action.user, role: action.role, activeTab: "dashboard" };
    case "LOGOUT": return { ...state, currentUser: null, role: null, activeTab: "dashboard" };
    case "SET_TAB": return { ...state, activeTab: action.tab };
    case "UPDATE_MARKS": return {
      ...state, students: state.students.map(st => st.id !== action.studentId ? st : {
        ...st, semesters: st.semesters.map(sem => sem.sem !== action.sem ? sem : {
          ...sem, subjects: sem.subjects.map(sub => sub.code !== action.code ? sub : { ...sub, marks: action.marks })
        })
      })
    };
    case "ADD_STUDENT": return { ...state, students: [...state.students, action.student] };
    case "ADD_REV_REQUEST": return { ...state, revRequests: [...state.revRequests, action.request] };
    case "UPDATE_REV_REQUEST": return {
      ...state,
      revRequests: state.revRequests.map(r => r.id !== action.id ? r : { ...r, ...action.updates }),
      students: (action.updates.status === "approved" && action.newMarks)
        ? state.students.map(st => st.id !== action.studentId ? st : {
          ...st, semesters: st.semesters.map(sem => sem.sem !== action.sem ? sem : {
            ...sem, subjects: sem.subjects.map(sub => sub.code !== action.code ? sub : { ...sub, marks: action.newMarks })
          })
        }) : state.students
    };
    case "ADD_NOTIFICATION": return { ...state, notifications: [action.notification, ...state.notifications] };
    case "READ_NOTIFICATION": return { ...state, notifications: state.notifications.map(n => n.id !== action.id ? n : { ...n, read: true }) };
    case "READ_ALL": return { ...state, notifications: state.notifications.map(n => n.userId !== state.currentUser?.id ? n : { ...n, read: true }) };
    case "UPDATE_PROFILE": return {
      ...state,
      students: state.students.map(st => st.id !== action.id ? st : { ...st, ...action.updates }),
      currentUser: state.currentUser?.id === action.id ? { ...state.currentUser, ...action.updates } : state.currentUser,
    };
    default: return state;
  }
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Av({ text, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
      {text}
    </div>
  );
}
function Badge({ children, color = C.accent }) {
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: color + "22", color, border: `1px solid ${color}44` }}>{children}</span>;
}
function Card({ children, style = {} }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", ...style }}>{children}</div>;
}
function StatCard({ label, value, sub, color = C.accent }) {
  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
      <p style={{ fontSize: 11, color: C.muted, margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0, fontFamily: "'DM Serif Display',serif" }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}
function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", width: "100%", border: "none", cursor: "pointer", borderRadius: 10, transition: "all .15s", textAlign: "left", fontFamily: "'DM Sans',sans-serif", fontWeight: active ? 600 : 400, fontSize: 14, background: active ? C.accent + "22" : "transparent", color: active ? C.accentL : C.muted }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge ? <span style={{ fontSize: 10, background: C.red, color: "#fff", borderRadius: 99, padding: "1px 6px", fontWeight: 700 }}>{badge}</span> : null}
    </button>
  );
}
function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'DM Serif Display',serif", color: C.text, margin: "0 0 20px", fontSize: 22 }}>{children}</h2>;
}

// ─── GRADE TABLE ─────────────────────────────────────────────────────────────
function GradeTable({ subjects }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["Code", "Subject", "Credits", "Marks", "Grade", "GP"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: C.muted, fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjects.map((sub, i) => {
            const { l, gp } = gradeFromMarks(sub.marks, sub.maxMarks);
            const isF = l === "F";
            return (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}20`, background: isF ? C.red + "08" : "transparent" }}>
                <td style={{ padding: "9px 10px", color: C.muted, fontFamily: "monospace", fontSize: 12 }}>{sub.code}</td>
                <td style={{ padding: "9px 10px", color: C.text, fontWeight: 500 }}>{sub.name} {isF && <Badge color={C.red}>BACKLOG</Badge>}</td>
                <td style={{ padding: "9px 10px", color: C.soft, textAlign: "center" }}>{sub.credits}</td>
                <td style={{ padding: "9px 10px", color: C.text, fontWeight: 600, textAlign: "center" }}>{sub.marks}/{sub.maxMarks}</td>
                <td style={{ padding: "9px 10px", textAlign: "center" }}><span style={{ fontWeight: 700, color: gColor(l), fontSize: 14 }}>{l}</span></td>
                <td style={{ padding: "9px 10px", textAlign: "center", color: C.soft }}>{gp}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: `1px solid ${C.border}` }}>
            <td colSpan={2} style={{ padding: "10px", fontWeight: 600, color: C.soft, fontSize: 13 }}>Semester SGPA</td>
            <td colSpan={4} style={{ padding: "10px", fontWeight: 700, color: C.gold, fontSize: 18, textAlign: "right", fontFamily: "'DM Serif Display',serif" }}>{calcSGPA(subjects)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ dispatch }) {
  const [form, setForm] = useState({ id: "", pass: "", role: "student" });
  const [err, setErr] = useState("");

  const CREDS = {
    student: [
      { id: "S001", pass: "pass123", name: "Deepak Reddy", rollNo: "CS21001", branch: "CSE", year: 3, email: "deepak.reddy@college.edu", phone: "9876543210", dob: "2003-04-12", avatar: "DR", id2: "S001" },
      { id: "S002", pass: "pass123", name: "Rajan Mehta",  rollNo: "CS21002", branch: "CSE", year: 3, email: "rajan@college.edu",             phone: "9876500001", dob: "2003-07-22", avatar: "RM", id2: "S002" },
      { id: "S003", pass: "pass123", name: "Priya Nair",   rollNo: "EC21001", branch: "ECE", year: 3, email: "priya@college.edu",             phone: "9123456789", dob: "2003-01-05", avatar: "PN", id2: "S003" },
    ],
    admin: [{ id: "ADMIN", pass: "admin123", name: "Dr. K. Reddy", avatar: "KR" }],
  };

  const handleLogin = () => {
    const user = CREDS[form.role].find(u => u.id === form.id && u.pass === form.pass);
    if (user) dispatch({ type: "LOGIN", user: { ...user, id: user.id2 || user.id }, role: form.role });
    else setErr("Invalid credentials. Try again.");
  };

  const inp = { width: "100%", padding: "10px 14px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <div style={{ width: 420, padding: "48px 40px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🎓</div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: C.text, margin: 0 }}>AcademiX</h1>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>Student Academic Records System</p>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: C.bg, borderRadius: 12, padding: 4 }}>
          {["student", "admin"].map(r => (
            <button key={r} onClick={() => setForm({ ...form, role: r, id: "", pass: "" })}
              style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: 13, background: form.role === r ? C.accent : "transparent", color: form.role === r ? "#fff" : C.muted }}>
              {r === "student" ? "Student" : "Admin"}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6, fontWeight: 500 }}>
            {form.role === "student" ? "Student ID" : "Admin ID"}
          </label>
          <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })}
            placeholder={form.role === "student" ? "S001 / S002 / S003" : "ADMIN"} style={inp} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6, fontWeight: 500 }}>Password</label>
          <input type="password" value={form.pass} onChange={e => setForm({ ...form, pass: e.target.value })}
            placeholder={form.role === "student" ? "pass123" : "admin123"}
            onKeyDown={e => e.key === "Enter" && handleLogin()} style={inp} />
        </div>
        {err && <p style={{ color: C.red, fontSize: 13, marginBottom: 14, textAlign: "center" }}>{err}</p>}
        <button onClick={handleLogin} style={{ width: "100%", padding: "12px", background: `linear-gradient(135deg,${C.accent},${C.purple})`, border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          Sign In
        </button>
        <div style={{ marginTop: 20, padding: 14, background: C.bg, borderRadius: 10, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.soft }}>Demo credentials:</strong><br />
          Students: S001 (Deepak), S002, S003 → pass123<br />
          Admin: ADMIN → admin123
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ student, notifications, dispatch }) {
  const cgpa = calcCGPA(student.semesters);
  const bl = getBL(student);
  const latestSem = student.semesters[student.semesters.length - 1];
  const latestAtt = student.attendance[student.attendance.length - 1];
  const overallAtt = latestAtt
    ? Math.round(latestAtt.subjects.reduce((a, s) => a + (s.present / s.total) * 100, 0) / latestAtt.subjects.length)
    : 0;
  const lowAttSubs = latestAtt ? latestAtt.subjects.filter(s => Math.round((s.present / s.total) * 100) < 75) : [];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Av text={student.avatar} size={52} />
          <div>
            <h2 style={{ margin: 0, fontSize: 22, color: C.text, fontFamily: "'DM Serif Display',serif" }}>Welcome back, {student.name.split(" ")[0]} 👋</h2>
            <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>{student.rollNo} · {student.branch} · Year {student.year}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="CGPA" value={cgpa} sub="Cumulative" color={parseFloat(cgpa) >= 7 ? C.green : parseFloat(cgpa) >= 5 ? C.gold : C.red} />
        <StatCard label="Latest SGPA" value={calcSGPA(latestSem.subjects)} sub={`Semester ${latestSem.sem}`} color={C.accentL} />
        <StatCard label="Attendance" value={overallAtt + "%"} sub="Sem 3 overall" color={attColor(overallAtt)} />
        <StatCard label="Backlogs" value={bl.length} sub={bl.length ? "Subjects to clear" : "All cleared ✓"} color={bl.length ? C.red : C.green} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: C.soft, fontWeight: 600 }}>📊 CGPA Trend</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 100 }}>
            {student.semesters.map((sem, i) => {
              const sgpa = parseFloat(calcSGPA(sem.subjects));
              const col = sgpa >= 7 ? C.green : sgpa >= 5 ? C.gold : C.red;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{sgpa}</span>
                  <div style={{ width: "100%", background: C.border, borderRadius: 4, height: 80, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                    <div style={{ width: "100%", height: `${(sgpa / 10) * 100}%`, background: col, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 10, color: C.muted }}>S{sem.sem}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, color: C.soft, fontWeight: 600 }}>🔔 Notifications</h3>
          {notifications.filter(n => n.userId === student.id).slice(0, 3).map(n => (
            <div key={n.id} onClick={() => dispatch({ type: "READ_NOTIFICATION", id: n.id })}
              style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 6, cursor: "pointer", background: n.read ? "transparent" : C.accent + "11", border: `1px solid ${n.read ? C.border + "40" : C.accent + "33"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>{n.type === "success" ? "✅" : n.type === "warning" ? "⚠️" : "ℹ️"}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: n.read ? C.muted : C.text }}>{n.title}</span>
                {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, marginLeft: "auto" }} />}
              </div>
              <p style={{ fontSize: 11, color: C.muted, margin: "3px 0 0 22px" }}>{n.message}</p>
            </div>
          ))}
        </Card>
      </div>

      {lowAttSubs.length > 0 && (
        <Card style={{ borderColor: C.orange + "55", background: C.orange + "08", marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: C.orange, fontWeight: 600 }}>📋 Low Attendance Alert</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {lowAttSubs.map((s, i) => {
              const pct = Math.round((s.present / s.total) * 100);
              return (
                <div key={i} style={{ background: C.orange + "15", border: `1px solid ${C.orange}44`, borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ margin: 0, fontWeight: 600, color: C.text, fontSize: 13 }}>{s.name}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>{pct}% · {s.present}/{s.total} classes attended</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {bl.length > 0 && (
        <Card style={{ borderColor: C.red + "55", background: C.red + "08" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: C.red, fontWeight: 600 }}>⚠️ Active Backlogs</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {bl.map((b, i) => (
              <div key={i} style={{ background: C.red + "15", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ margin: 0, fontWeight: 600, color: C.text, fontSize: 13 }}>{b.name}</p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>{b.code} · Sem {b.sem} · {b.marks}/{b.maxMarks}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── MARKS VIEW ───────────────────────────────────────────────────────────────
function MarksView({ student }) {
  const [activeSem, setActiveSem] = useState(student.semesters.length - 1);
  const sem = student.semesters[activeSem];
  return (
    <div>
      <SectionTitle>Marks & Grades</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {student.semesters.map((s, i) => (
          <button key={i} onClick={() => setActiveSem(i)}
            style={{ padding: "7px 16px", borderRadius: 99, border: `1px solid ${activeSem === i ? C.accent : C.border}`, background: activeSem === i ? C.accent + "22" : "transparent", color: activeSem === i ? C.accentL : C.muted, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            Semester {s.sem}
          </button>
        ))}
      </div>
      <Card><GradeTable subjects={sem.subjects} /></Card>
    </div>
  );
}

// ─── CGPA VIEW ────────────────────────────────────────────────────────────────
function CGPAView({ student }) {
  const cgpa = parseFloat(calcCGPA(student.semesters));
  const bl = getBL(student);
  return (
    <div>
      <SectionTitle>CGPA Overview</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>
        <Card style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", border: `8px solid ${cgpa >= 7 ? C.green : cgpa >= 5 ? C.gold : C.red}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "'DM Serif Display',serif", color: C.text }}>{cgpa.toFixed(2)}</span>
          </div>
          <p style={{ margin: 0, fontWeight: 600, color: C.soft }}>CGPA</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: cgpa >= 7 ? C.green : cgpa >= 5 ? C.gold : C.red }}>
            {cgpa >= 9 ? "Outstanding" : cgpa >= 7 ? "Distinction" : cgpa >= 5 ? "Passing" : "Needs Improvement"}
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: C.soft, fontWeight: 600 }}>Semester-wise SGPA</h3>
          {student.semesters.map((sem, i) => {
            const sgpa = parseFloat(calcSGPA(sem.subjects));
            const col = sgpa >= 7 ? C.green : sgpa >= 5 ? C.gold : C.red;
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: C.soft }}>Semester {sem.sem}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: col }}>{sgpa.toFixed(2)}</span>
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(sgpa / 10) * 100}%`, background: col, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
      {bl.length > 0 ? (
        <Card style={{ borderColor: C.red + "55" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, color: C.red }}>Active Backlogs ({bl.length})</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>{["Subject", "Sem", "Marks"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: C.muted, fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
            <tbody>
              {bl.map((b, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "9px 10px", color: C.text }}>{b.name} <span style={{ color: C.muted, fontSize: 11 }}>({b.code})</span></td>
                  <td style={{ padding: "9px 10px", color: C.muted }}>Sem {b.sem}</td>
                  <td style={{ padding: "9px 10px", color: C.red, fontWeight: 700 }}>{b.marks}/{b.maxMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card style={{ textAlign: "center", borderColor: C.green + "55" }}>
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>🎉</p>
          <p style={{ color: C.green, fontWeight: 600, margin: 0 }}>No backlogs! All subjects cleared.</p>
        </Card>
      )}
    </div>
  );
}

// ─── ATTENDANCE VIEW ──────────────────────────────────────────────────────────
function AttendanceView({ student }) {
  const [selSem, setSelSem] = useState(student.attendance.length - 1);
  const semData = student.attendance[selSem];

  function classesNeeded(s) {
    const needed = Math.ceil((0.75 * s.total - s.present) / (1 - 0.75));
    return needed > 0 ? needed : 0;
  }
  function canSkip(s) {
    let extra = 0, t = s.total, p = s.present;
    while (((p) / (t + extra)) >= 0.75) extra++;
    return Math.max(0, extra - 1);
  }

  const overall = semData
    ? Math.round(semData.subjects.reduce((a, s) => a + (s.present / s.total) * 100, 0) / semData.subjects.length)
    : 0;

  return (
    <div>
      <SectionTitle>Attendance Tracker</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {student.attendance.map((a, i) => (
          <button key={i} onClick={() => setSelSem(i)}
            style={{ padding: "7px 16px", borderRadius: 99, border: `1px solid ${selSem === i ? C.accent : C.border}`, background: selSem === i ? C.accent + "22" : "transparent", color: selSem === i ? C.accentL : C.muted, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            Semester {a.sem}
          </button>
        ))}
      </div>

      {semData && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 20 }}>
            <StatCard label="Overall Attendance" value={overall + "%"} sub="This semester" color={attColor(overall)} />
            <StatCard label="Subjects at Risk" value={semData.subjects.filter(s => Math.round((s.present / s.total) * 100) < 75).length} sub="Below 75%" color={C.red} />
            <StatCard label="Total Classes" value={semData.subjects.reduce((a, s) => a + s.total, 0)} sub="Conducted" color={C.accent} />
            <StatCard label="Classes Attended" value={semData.subjects.reduce((a, s) => a + s.present, 0)} sub="Present" color={C.green} />
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {semData.subjects.map((s, i) => {
              const pct = Math.round((s.present / s.total) * 100);
              const col = attColor(pct);
              const needed = classesNeeded(s);
              const skippable = canSkip(s);
              return (
                <Card key={i} style={{ borderColor: pct < 75 ? C.red + "55" : C.border }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div>
                          <span style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{s.name}</span>
                          <span style={{ color: C.muted, fontSize: 12, marginLeft: 8 }}>{s.code}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontFamily: "monospace", color: C.soft, fontSize: 13 }}>{s.present}/{s.total} classes</span>
                          <span style={{ fontSize: 22, fontWeight: 700, color: col, fontFamily: "'DM Serif Display',serif" }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ position: "relative", height: 8, background: C.border, borderRadius: 99, overflow: "visible", marginBottom: 8 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 99 }} />
                        {/* 75% marker */}
                        <div style={{ position: "absolute", left: "75%", top: -4, width: 2, height: 16, background: C.muted + "99", borderRadius: 1 }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: C.muted }}>75% threshold marker shown above</span>
                        {pct < 75
                          ? <span style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>⚠ Attend {needed} more class{needed !== 1 ? "es" : ""} to reach 75%</span>
                          : <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>✓ Can safely skip {skippable} class{skippable !== 1 ? "es" : ""}</span>
                        }
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TIMETABLE VIEW ───────────────────────────────────────────────────────────
function TimetableView() {
  const SUB_COLORS = { CS301: C.accent, CS302: C.purple, CS303: C.orange, CS304: C.green };
  const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  const TIME_SLOTS = ["9-10", "10-11", "11-12", "12-1", "2-3", "3-4"];

  return (
    <div>
      <SectionTitle>Weekly Timetable</SectionTitle>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Semester 3 odd schedule · Today's row is highlighted</p>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={{ textAlign: "left", padding: "12px 16px", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, width: 110 }}>Day</th>
                {TIME_SLOTS.map(t => (
                  <th key={t} style={{ padding: "12px 8px", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, textAlign: "center" }}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE.map((row, i) => {
                const isToday = row.day === todayName;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}20`, background: isToday ? C.accent + "10" : "transparent" }}>
                    <td style={{ padding: "12px 16px", fontWeight: isToday ? 700 : 500, color: isToday ? C.accentL : C.soft, fontSize: 13, whiteSpace: "nowrap" }}>
                      {row.day}
                      {isToday && <span style={{ marginLeft: 6, fontSize: 9, background: C.accent, color: "#fff", borderRadius: 99, padding: "2px 6px" }}>TODAY</span>}
                    </td>
                    {row.slots.map((slot, j) => {
                      const col = slot.code ? SUB_COLORS[slot.code] || C.accentL : null;
                      const isBreak = !slot.code;
                      return (
                        <td key={j} style={{ padding: "6px" }}>
                          <div style={{ borderRadius: 8, padding: "8px 6px", background: isBreak ? "transparent" : col + "18", border: isBreak ? "none" : `1px solid ${col}33`, textAlign: "center", minHeight: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: isBreak ? C.muted + "80" : col }}>{slot.sub}</div>
                            {slot.code && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{slot.code}</div>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.entries({ CS301: "Algorithms", CS302: "OS Concepts", CS303: "Computer Networks", CS304: "Database Systems" }).map(([code, name]) => (
          <div key={code} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: SUB_COLORS[code] }} />
            <span style={{ fontSize: 11, color: C.muted }}>{code} – {name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GPA CALCULATOR ───────────────────────────────────────────────────────────
function GPACalcView() {
  const [subjects, setSubjects] = useState([
    { name: "Subject 1", credits: 4, marks: 75 },
    { name: "Subject 2", credits: 3, marks: 60 },
    { name: "Subject 3", credits: 4, marks: 88 },
    { name: "Subject 4", credits: 3, marks: 55 },
  ]);

  const sgpa = calcSGPA(subjects.map(s => ({ ...s, maxMarks: 100 })));
  const sgpaNum = parseFloat(sgpa);

  const addRow = () => setSubjects([...subjects, { name: `Subject ${subjects.length + 1}`, credits: 3, marks: 70 }]);
  const removeRow = i => setSubjects(subjects.filter((_, j) => j !== i));
  const update = (i, k, v) => setSubjects(subjects.map((s, j) => j === i ? { ...s, [k]: v } : s));

  const inp = (w) => ({ width: w || "100%", padding: "6px 8px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 12, outline: "none", textAlign: "center" });

  return (
    <div>
      <SectionTitle>GPA Calculator</SectionTitle>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Simulate your SGPA before results are announced. Edit any field to see instant predictions.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>
        <Card style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
          <div style={{ width: 130, height: 130, borderRadius: "50%", border: `8px solid ${sgpaNum >= 7 ? C.green : sgpaNum >= 5 ? C.gold : C.red}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 34, fontWeight: 800, fontFamily: "'DM Serif Display',serif", color: C.text }}>{sgpa}</span>
          </div>
          <p style={{ margin: 0, fontWeight: 600, color: C.soft, fontSize: 14 }}>Predicted SGPA</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 600, color: sgpaNum >= 9 ? C.gold : sgpaNum >= 7 ? C.green : sgpaNum >= 5 ? C.orange : C.red }}>
            {sgpaNum >= 9 ? "Outstanding 🏆" : sgpaNum >= 7 ? "Distinction ⭐" : sgpaNum >= 5 ? "Passing 👍" : "Needs Work ⚠️"}
          </p>
          <div style={{ marginTop: 16, width: "100%", background: C.surface2, borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Credits</p>
            <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: C.accent }}>{subjects.reduce((a, s) => a + s.credits, 0)}</p>
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, color: C.soft, fontWeight: 600 }}>Grade Breakdown</h3>
          {subjects.map((s, i) => {
            const { l, gp } = gradeFromMarks(s.marks, 100);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}20` }}>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ margin: 0, fontSize: 13, color: C.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{s.credits} credits · {s.marks}/100</p>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0, marginLeft: 12 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: gColor(l) }}>{l}</span>
                  <span style={{ fontSize: 12, color: C.muted, width: 50 }}>GP: {gp}</span>
                  <div style={{ width: 60, height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(s.marks / 100) * 100}%`, background: gColor(l), borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, color: C.soft, fontWeight: 600, margin: 0 }}>Enter Subject Details</h3>
          <button onClick={addRow} style={{ padding: "7px 16px", background: C.accent, border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>+ Add Subject</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Subject Name", "Credits", "Marks (out of 100)", "Grade", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 11, color: C.muted, textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => {
                const { l } = gradeFromMarks(s.marks, 100);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}20` }}>
                    <td style={{ padding: "7px 8px" }}>
                      <input value={s.name} onChange={e => update(i, "name", e.target.value)} style={{ ...inp(), textAlign: "left", width: 160 }} />
                    </td>
                    <td style={{ padding: "7px 8px" }}>
                      <input type="number" min={1} max={6} value={s.credits} onChange={e => update(i, "credits", Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))} style={inp(60)} />
                    </td>
                    <td style={{ padding: "7px 8px" }}>
                      <input type="number" min={0} max={100} value={s.marks} onChange={e => update(i, "marks", Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))} style={inp(80)} />
                    </td>
                    <td style={{ padding: "7px 8px", textAlign: "center" }}>
                      <span style={{ fontWeight: 700, color: gColor(l), fontSize: 15 }}>{l}</span>
                    </td>
                    <td style={{ padding: "7px 8px", textAlign: "center" }}>
                      <button onClick={() => removeRow(i)} style={{ background: "transparent", border: "none", color: C.red, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── AI STUDY ASSISTANT ───────────────────────────────────────────────────────
function AIAssistantView({ student }) {
  const cgpa = calcCGPA(student.semesters);
  const bl = getBL(student);
  const latestSem = student.semesters[student.semesters.length - 1];
  const latestAtt = student.attendance[student.attendance.length - 1];
  const lowAtt = latestAtt ? latestAtt.subjects.filter(s => Math.round((s.present / s.total) * 100) < 75) : [];

  const [msgs, setMsgs] = useState([
    { role: "assistant", text: `Hi Deepak! 👋 I'm your AI study assistant. I can see your full academic profile — CGPA ${cgpa}, ${bl.length} backlog${bl.length !== 1 ? "s" : ""}, and ${lowAtt.length} subject${lowAtt.length !== 1 ? "s" : ""} with low attendance. Ask me anything!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const SUGGESTIONS = [
    "How can I improve my CGPA?",
    "Tips to clear my Algorithms backlog",
    "Which subjects need most attention?",
    "How many classes can I skip safely?",
    "Create a study schedule for me",
    "How to balance attendance and studies?",
  ];

  const buildSystemPrompt = () => `You are an AI study assistant for ${student.name}, a ${student.branch} Year-${student.year} engineering student at AcademiX College of Engineering, Hyderabad.

STUDENT ACADEMIC PROFILE:
- CGPA: ${cgpa} | Latest SGPA: ${calcSGPA(latestSem.subjects)}
- Backlogs: ${bl.length > 0 ? bl.map(b => `${b.name} (Sem ${b.sem}, scored ${b.marks}/${b.maxMarks})`).join(", ") : "None"}
- Low attendance subjects: ${lowAtt.length > 0 ? lowAtt.map(s => `${s.name} (${Math.round((s.present / s.total) * 100)}%)`).join(", ") : "None"}
- Sem 3 marks: ${latestSem.subjects.map(s => `${s.name}: ${s.marks}/100 (${gradeFromMarks(s.marks, s.maxMarks).l})`).join(", ")}
- Attendance Sem 3: ${latestAtt ? latestAtt.subjects.map(s => `${s.name}: ${Math.round((s.present / s.total) * 100)}%`).join(", ") : "No data"}

Be warm, concise, practical and encouraging. Address the student as Deepak. Give actionable advice specific to his profile. Keep responses under 200 words unless asked for more detail.`;

  const send = async (text) => {
    const userText = text || input;
    if (!userText.trim() || loading) return;
    const userMsg = { role: "user", text: userText };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const apiMessages = newMsgs
        .filter((_, i) => i > 0)
        .map(m => ({ role: m.role, content: m.text }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: apiMessages,
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't respond right now. Please try again.";
      setMsgs(m => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", text: "Connection error. Please check your network and try again." }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle>AI Study Assistant</SectionTitle>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>Personalized advice powered by Claude — knows your grades, attendance, and backlogs.</p>

      <Card style={{ display: "flex", flexDirection: "column" }}>
        {/* Chat window */}
        <div style={{ overflowY: "auto", maxHeight: 420, marginBottom: 16, paddingRight: 4 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
              {m.role === "assistant" && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.purple + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 2 }}>🤖</div>
              )}
              <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: 14, background: m.role === "user" ? C.accent : C.surface2, color: C.text, fontSize: 13, lineHeight: 1.65, borderBottomRightRadius: m.role === "user" ? 2 : 14, borderBottomLeftRadius: m.role === "assistant" ? 2 : 14, whiteSpace: "pre-wrap" }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.purple + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8 }}>🤖</div>
              <div style={{ padding: "10px 14px", borderRadius: 14, borderBottomLeftRadius: 2, background: C.surface2, color: C.muted, fontSize: 13 }}>Thinking...</div>
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => send(s)}
              style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 99, color: C.muted, fontSize: 11, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask me anything about your studies, performance, or schedule..."
            style={{ flex: 1, padding: "10px 14px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none" }} />
          <button onClick={() => send()} disabled={loading}
            style={{ padding: "10px 22px", background: loading ? C.muted : C.accent, border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: loading ? "not-allowed" : "pointer" }}>
            Send
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── RE-VALUATION VIEW ────────────────────────────────────────────────────────
function RevalView({ student, revRequests, dispatch }) {
  const [form, setForm] = useState({ sem: "", subCode: "", reason: "" });
  const [submitted, setSubmitted] = useState(false);
  const allSubs = student.semesters.flatMap(sem => sem.subjects.map(s => ({ ...s, sem: sem.sem })));
  const myReqs = revRequests.filter(r => r.studentId === student.id);
  const sColor = s => s === "approved" ? C.green : s === "rejected" ? C.red : C.gold;

  const handleSubmit = () => {
    if (!form.sem || !form.subCode || !form.reason) return;
    const sub = allSubs.find(s => s.code === form.subCode);
    const req = { id: "RV" + Date.now(), studentId: student.id, studentName: student.name, subject: sub.name, code: sub.code, sem: parseInt(form.sem), currentMarks: sub.marks, reason: form.reason, status: "pending", date: new Date().toISOString().split("T")[0] };
    dispatch({ type: "ADD_REV_REQUEST", request: req });
    dispatch({ type: "ADD_NOTIFICATION", notification: { id: "N" + Date.now(), userId: student.id, title: "Request Submitted", message: `Re-valuation for ${sub.name} submitted successfully.`, type: "info", read: false, date: req.date } });
    setForm({ sem: "", subCode: "", reason: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const sel = { width: "100%", padding: "10px 12px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none", marginBottom: 14 };

  return (
    <div>
      <SectionTitle>Re-valuation Request</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 18px", fontSize: 14, color: C.soft, fontWeight: 600 }}>Submit New Request</h3>
          {submitted && <div style={{ padding: "10px 14px", background: C.green + "20", border: `1px solid ${C.green}44`, borderRadius: 10, marginBottom: 16, color: C.green, fontSize: 13, fontWeight: 500 }}>✅ Request submitted successfully!</div>}
          <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Select Semester</label>
          <select value={form.sem} onChange={e => setForm({ ...form, sem: e.target.value, subCode: "" })} style={sel}>
            <option value="">-- Select Semester --</option>
            {student.semesters.map(s => <option key={s.sem} value={s.sem}>Semester {s.sem}</option>)}
          </select>
          <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Select Subject</label>
          <select value={form.subCode} onChange={e => setForm({ ...form, subCode: e.target.value })} style={sel}>
            <option value="">-- Select Subject --</option>
            {form.sem && student.semesters.find(s => s.sem === parseInt(form.sem))?.subjects.map(sub => (
              <option key={sub.code} value={sub.code}>{sub.name} ({sub.marks} marks)</option>
            ))}
          </select>
          <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Reason for Re-valuation</label>
          <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={4} placeholder="Explain your reason..."
            style={{ width: "100%", padding: "10px 12px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
          <button onClick={handleSubmit} style={{ width: "100%", padding: "11px", background: C.accent, border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Submit Request
          </button>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: C.soft, fontWeight: 600 }}>My Requests ({myReqs.length})</h3>
          {myReqs.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>No requests submitted yet.</p>}
          {myReqs.map(r => (
            <div key={r.id} style={{ padding: "14px", background: C.surface2, borderRadius: 12, marginBottom: 10, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{r.subject}</span>
                <Badge color={sColor(r.status)}>{r.status.toUpperCase()}</Badge>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: C.muted }}>Sem {r.sem} · Current: {r.currentMarks}{r.newMarks ? ` → Updated: ${r.newMarks}` : ""}</p>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: C.soft, fontStyle: "italic" }}>"{r.reason.substring(0, 80)}..."</p>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>{r.date}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── TRANSCRIPT ───────────────────────────────────────────────────────────────
function TranscriptView({ student }) {
  const cgpa = calcCGPA(student.semesters);
  const bl = getBL(student);
  return (
    <div>
      <SectionTitle>Official Transcript</SectionTitle>
      <Card>
        <div style={{ textAlign: "center", borderBottom: `2px solid ${C.border}`, paddingBottom: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🎓</div>
          <h1 style={{ margin: 0, fontSize: 20, color: C.text, fontFamily: "'DM Serif Display',serif" }}>AcademiX College of Engineering</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Hyderabad, Telangana</p>
          <p style={{ margin: "10px auto 0", fontSize: 14, fontWeight: 700, color: C.accentL, background: C.accent + "22", display: "inline-block", padding: "4px 16px", borderRadius: 99 }}>OFFICIAL ACADEMIC TRANSCRIPT</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20, fontSize: 13 }}>
          <div><span style={{ color: C.muted }}>Student Name: </span><strong style={{ color: C.text }}>{student.name}</strong></div>
          <div><span style={{ color: C.muted }}>Roll Number: </span><strong style={{ color: C.text }}>{student.rollNo}</strong></div>
          <div><span style={{ color: C.muted }}>Branch: </span><strong style={{ color: C.text }}>{student.branch}</strong></div>
          <div><span style={{ color: C.muted }}>Email: </span><strong style={{ color: C.text }}>{student.email}</strong></div>
          <div><span style={{ color: C.muted }}>CGPA: </span><strong style={{ color: C.gold, fontSize: 16 }}>{cgpa}</strong></div>
          <div><span style={{ color: C.muted }}>Backlogs: </span><strong style={{ color: bl.length ? C.red : C.green }}>{bl.length ? `${bl.length} active` : "None"}</strong></div>
        </div>
        {student.semesters.map((sem, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ padding: "8px 14px", background: C.surface2, borderRadius: "10px 10px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>Semester {sem.sem}</span>
              <span style={{ color: C.gold, fontWeight: 700 }}>SGPA: {calcSGPA(sem.subjects)}</span>
            </div>
            <GradeTable subjects={sem.subjects} />
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
          <p>Generated on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p>This is a digitally generated transcript. Official physical copies available at the Registrar's office.</p>
        </div>
      </Card>
      <button onClick={() => window.print?.()}
        style={{ marginTop: 16, padding: "12px 28px", background: C.accent, border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
        ⬇ Download / Print Transcript
      </button>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfileView({ student, dispatch }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: student.name, email: student.email, phone: student.phone });
  const save = () => { dispatch({ type: "UPDATE_PROFILE", id: student.id, updates: form }); setEdit(false); };
  const inp = { display: "block", width: "100%", marginTop: 4, padding: "9px 12px", background: C.surface2, border: `1px solid ${C.accent}`, borderRadius: 8, color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" };
  return (
    <div>
      <SectionTitle>My Profile</SectionTitle>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <Av text={student.avatar} size={72} />
          <div>
            <h3 style={{ margin: 0, fontSize: 20, color: C.text, fontFamily: "'DM Serif Display',serif" }}>{student.name}</h3>
            <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13 }}>{student.rollNo} · {student.branch} · Year {student.year}</p>
            <p style={{ margin: "4px 0 0", color: C.accentL, fontSize: 13 }}>CGPA: {calcCGPA(student.semesters)}</p>
          </div>
          <button onClick={() => setEdit(!edit)}
            style={{ marginLeft: "auto", padding: "8px 18px", background: edit ? C.red + "22" : C.accent + "22", border: `1px solid ${edit ? C.red : C.accent}`, borderRadius: 10, color: edit ? C.red : C.accent, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontWeight: 500, fontSize: 13 }}>
            {edit ? "Cancel" : "✏ Edit"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "Full Name", key: "name", val: student.name },
            { label: "Email", key: "email", val: student.email },
            { label: "Phone", key: "phone", val: student.phone },
            { label: "Date of Birth", key: null, val: student.dob },
            { label: "Roll Number", key: null, val: student.rollNo },
            { label: "Branch", key: null, val: student.branch },
          ].map(field => (
            <div key={field.label}>
              <label style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>{field.label}</label>
              {edit && field.key
                ? <input value={form[field.key] || field.val} onChange={e => setForm({ ...form, [field.key]: e.target.value })} style={inp} />
                : <p style={{ margin: "4px 0 0", color: C.text, fontSize: 14, fontWeight: 500 }}>{field.val}</p>
              }
            </div>
          ))}
        </div>
        {edit && (
          <button onClick={save} style={{ marginTop: 20, padding: "11px 28px", background: C.green, border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Save Changes
          </button>
        )}
      </Card>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NotifsView({ notifications, userId, dispatch }) {
  const mine = notifications.filter(n => n.userId === userId);
  const icon = t => t === "success" ? "✅" : t === "warning" ? "⚠️" : t === "danger" ? "🚨" : "ℹ️";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>Notifications</SectionTitle>
        <button onClick={() => dispatch({ type: "READ_ALL" })}
          style={{ padding: "7px 16px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontSize: 12 }}>
          Mark all read
        </button>
      </div>
      {mine.length === 0 && <Card><p style={{ color: C.muted, textAlign: "center" }}>No notifications.</p></Card>}
      {mine.map(n => (
        <div key={n.id} onClick={() => dispatch({ type: "READ_NOTIFICATION", id: n.id })}
          style={{ padding: "16px", background: n.read ? C.surface : C.surface2, border: `1px solid ${n.read ? C.border : C.accent + "44"}`, borderRadius: 14, marginBottom: 10, cursor: "pointer" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>{icon(n.type)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{n.title}</span>
                {!n.read && <span style={{ width: 8, height: 8, background: C.accent, borderRadius: "50%", marginTop: 6 }} />}
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.soft }}>{n.message}</p>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>{n.date}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ACADEMIC HISTORY ─────────────────────────────────────────────────────────
function HistoryView({ student }) {
  return (
    <div>
      <SectionTitle>Academic History</SectionTitle>
      {student.semesters.map((sem, i) => (
        <Card key={i} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, color: C.text, fontFamily: "'DM Serif Display',serif", fontSize: 18 }}>Semester {sem.sem}</h3>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>{sem.subjects.length} subjects · {sem.subjects.reduce((a, s) => a + s.credits, 0)} credits</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.gold, fontFamily: "'DM Serif Display',serif" }}>{calcSGPA(sem.subjects)}</p>
              <p style={{ margin: 0, fontSize: 11, color: C.muted }}>SGPA</p>
            </div>
          </div>
          <GradeTable subjects={sem.subjects} />
        </Card>
      ))}
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ state, dispatch }) {
  const [tab, setTab] = useState("students");
  const [selSt, setSelSt] = useState(null);
  const [markEdit, setMarkEdit] = useState({});

  const totalBL = state.students.reduce((a, s) => a + getBL(s).length, 0);
  const avgCGPA = (state.students.reduce((a, s) => a + parseFloat(calcCGPA(s.semesters)), 0) / state.students.length).toFixed(2);
  const pendingRevs = state.revRequests.filter(r => r.status === "pending").length;
  const TABS = [{ id: "students", label: "Students" }, { id: "marks", label: "Marks Entry" }, { id: "revaluation", label: "Re-valuation Queue" }, { id: "analytics", label: "Analytics" }];

  const sel = { padding: "9px 14px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none", width: "100%" };

  return (
    <div>
      <SectionTitle>Admin Panel</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Students" value={state.students.length} color={C.accent} />
        <StatCard label="Average CGPA" value={avgCGPA} color={C.green} />
        <StatCard label="Total Backlogs" value={totalBL} color={C.red} />
        <StatCard label="Pending Reviews" value={pendingRevs} color={C.gold} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "8px 16px", borderRadius: 99, border: `1px solid ${tab === t.id ? C.accent : C.border}`, background: tab === t.id ? C.accent + "22" : "transparent", color: tab === t.id ? C.accentL : C.muted, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "students" && (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Student", "Roll No", "Branch", "CGPA", "Attendance", "Backlogs", "Action"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.muted, fontSize: 11, textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.students.map(st => {
                const cgpa = calcCGPA(st.semesters);
                const bl = getBL(st).length;
                const la = st.attendance[st.attendance.length - 1];
                const att = la ? Math.round(la.subjects.reduce((a, s) => a + (s.present / s.total) * 100, 0) / la.subjects.length) : 0;
                return (
                  <tr key={st.id} style={{ borderBottom: `1px solid ${C.border}20` }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Av text={st.avatar} size={32} />
                        <div><p style={{ margin: 0, fontWeight: 600, color: C.text }}>{st.name}</p><p style={{ margin: 0, fontSize: 11, color: C.muted }}>{st.email}</p></div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", color: C.soft, fontFamily: "monospace" }}>{st.rollNo}</td>
                    <td style={{ padding: "10px 12px" }}><Badge color={C.purple}>{st.branch}</Badge></td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: parseFloat(cgpa) >= 7 ? C.green : parseFloat(cgpa) >= 5 ? C.gold : C.red }}>{cgpa}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: attColor(att) }}>{att}%</td>
                    <td style={{ padding: "10px 12px" }}>{bl > 0 ? <Badge color={C.red}>{bl}</Badge> : <span style={{ color: C.green }}>✓</span>}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <button onClick={() => { setSelSt(st); setTab("marks"); }}
                        style={{ padding: "5px 14px", background: C.accent + "22", border: `1px solid ${C.accent}44`, borderRadius: 7, color: C.accent, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontSize: 12 }}>
                        Edit Marks
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "marks" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 8 }}>Select Student</label>
            <select value={selSt?.id || ""} onChange={e => setSelSt(state.students.find(s => s.id === e.target.value) || null)} style={sel}>
              <option value="">-- Select a student --</option>
              {state.students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
            </select>
          </Card>
          {selSt && selSt.semesters.map(sem => (
            <Card key={sem.sem} style={{ marginBottom: 14 }}>
              <h4 style={{ margin: "0 0 14px", color: C.text, fontFamily: "'DM Serif Display',serif", fontSize: 16 }}>Semester {sem.sem}</h4>
              {sem.subjects.map(sub => (
                <div key={sub.code} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "10px 12px", background: C.surface2, borderRadius: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>{sub.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{sub.code} · {sub.credits} credits</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" min={0} max={sub.maxMarks}
                      value={markEdit[`${selSt.id}-${sub.code}`] ?? sub.marks}
                      onChange={e => setMarkEdit({ ...markEdit, [`${selSt.id}-${sub.code}`]: parseInt(e.target.value) || 0 })}
                      style={{ width: 70, padding: "7px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none", textAlign: "center" }} />
                    <span style={{ color: C.muted, fontSize: 12 }}>/ {sub.maxMarks}</span>
                    <button onClick={() => {
                      const nm = markEdit[`${selSt.id}-${sub.code}`] ?? sub.marks;
                      dispatch({ type: "UPDATE_MARKS", studentId: selSt.id, sem: sem.sem, code: sub.code, marks: nm });
                    }} style={{ padding: "6px 14px", background: C.green + "22", border: `1px solid ${C.green}44`, borderRadius: 7, color: C.green, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {tab === "revaluation" && (
        <div>
          {state.revRequests.length === 0 && <Card><p style={{ color: C.muted, textAlign: "center" }}>No re-valuation requests.</p></Card>}
          {state.revRequests.map(r => (
            <Card key={r.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <Badge color={r.status === "approved" ? C.green : r.status === "rejected" ? C.red : C.gold}>{r.status.toUpperCase()}</Badge>
                    <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{r.subject} ({r.code})</span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: C.muted }}><strong style={{ color: C.soft }}>{r.studentName}</strong> · Sem {r.sem} · Current: {r.currentMarks}</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.soft, fontStyle: "italic" }}>"{r.reason}"</p>
                </div>
                {r.status === "pending" && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => {
                      const nm = parseInt(prompt("Enter revised marks:")) || r.currentMarks;
                      dispatch({ type: "UPDATE_REV_REQUEST", id: r.id, studentId: r.studentId, sem: r.sem, code: r.code, updates: { status: "approved", newMarks: nm }, newMarks: nm });
                      dispatch({ type: "ADD_NOTIFICATION", notification: { id: "N" + Date.now(), userId: r.studentId, title: "Re-valuation Approved", message: `${r.subject} re-valuation approved. Marks: ${nm}`, type: "success", read: false, date: new Date().toISOString().split("T")[0] } });
                    }} style={{ padding: "8px 16px", background: C.green + "22", border: `1px solid ${C.green}`, borderRadius: 8, color: C.green, cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>✓ Approve</button>
                    <button onClick={() => {
                      dispatch({ type: "UPDATE_REV_REQUEST", id: r.id, updates: { status: "rejected" } });
                      dispatch({ type: "ADD_NOTIFICATION", notification: { id: "N" + Date.now(), userId: r.studentId, title: "Re-valuation Rejected", message: `${r.subject} request rejected.`, type: "danger", read: false, date: new Date().toISOString().split("T")[0] } });
                    }} style={{ padding: "8px 16px", background: C.red + "22", border: `1px solid ${C.red}`, borderRadius: 8, color: C.red, cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>✕ Reject</button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, color: C.soft }}>Student CGPA Comparison</h3>
            {state.students.map(st => {
              const cgpa = parseFloat(calcCGPA(st.semesters));
              const col = cgpa >= 7 ? C.green : cgpa >= 5 ? C.gold : C.red;
              return (
                <div key={st.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Av text={st.avatar} size={22} />
                      <span style={{ fontSize: 12, color: C.soft }}>{st.name.split(" ")[0]}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: col }}>{cgpa.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(cgpa / 10) * 100}%`, background: col, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, color: C.soft }}>Attendance Overview</h3>
            {state.students.map(st => {
              const la = st.attendance[st.attendance.length - 1];
              const att = la ? Math.round(la.subjects.reduce((a, s) => a + (s.present / s.total) * 100, 0) / la.subjects.length) : 0;
              const col = attColor(att);
              return (
                <div key={st.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Av text={st.avatar} size={22} />
                      <span style={{ fontSize: 12, color: C.soft }}>{st.name.split(" ")[0]}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: col }}>{att}%</span>
                  </div>
                  <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${att}%`, background: col, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </Card>

          <Card style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, color: C.soft }}>Backlog Summary</h3>
            {state.students.map(st => {
              const bl = getBL(st);
              return (
                <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}20` }}>
                  <Av text={st.avatar} size={32} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: C.text, fontSize: 13 }}>{st.name}</p>
                    {bl.length > 0
                      ? <p style={{ margin: "2px 0 0", fontSize: 11, color: C.red }}>{bl.map(b => b.name).join(", ")}</p>
                      : <p style={{ margin: "2px 0 0", fontSize: 11, color: C.green }}>No backlogs</p>
                    }
                  </div>
                  <Badge color={bl.length > 0 ? C.red : C.green}>{bl.length > 0 ? `${bl.length} backlog${bl.length > 1 ? "s" : ""}` : "Clear"}</Badge>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, initState);

  if (!state.currentUser) return <LoginPage dispatch={dispatch} />;

  const isAdmin = state.role === "admin";
  const student = state.students.find(s => s.id === state.currentUser?.id);
  const unread = state.notifications.filter(n => n.userId === state.currentUser?.id && !n.read).length;

  const STUDENT_NAV = [
    { id: "dashboard",    icon: "🏠", label: "Dashboard" },
    { id: "marks",        icon: "📋", label: "Marks & Grades" },
    { id: "cgpa",         icon: "📊", label: "CGPA Overview" },
    { id: "attendance",   icon: "📅", label: "Attendance" },
    { id: "history",      icon: "🗂",  label: "Academic History" },
    { id: "timetable",    icon: "🗓",  label: "Timetable" },
    { id: "gpa-calc",     icon: "🧮", label: "GPA Calculator" },
    { id: "revaluation",  icon: "🔄", label: "Re-valuation" },
    { id: "transcript",   icon: "📄", label: "Transcript" },
    { id: "ai-assistant", icon: "🤖", label: "AI Assistant" },
    { id: "notifications",icon: "🔔", label: "Notifications", badge: unread || null },
    { id: "profile",      icon: "👤", label: "Profile" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: 232, background: C.surface, borderRight: `1px solid ${C.border}`, padding: "20px 12px", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 20px", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎓</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, fontFamily: "'DM Serif Display',serif", color: C.text }}>AcademiX</p>
            <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{isAdmin ? "Admin Portal" : "Student Portal"}</p>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {isAdmin
            ? <NavItem icon="⚙️" label="Admin Panel" active={true} onClick={() => {}} />
            : STUDENT_NAV.map(item => <NavItem key={item.id} {...item} active={state.activeTab === item.id} onClick={() => dispatch({ type: "SET_TAB", tab: item.id })} />)
          }
        </nav>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: C.surface2, marginBottom: 8 }}>
            <Av text={state.currentUser.avatar} size={30} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{state.currentUser.name?.split(" ")[0]}</p>
              <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{isAdmin ? "Administrator" : state.currentUser.rollNo}</p>
            </div>
          </div>
          <button onClick={() => dispatch({ type: "LOGOUT" })}
            style={{ width: "100%", padding: "8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontSize: 12 }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minWidth: 0 }}>
        {isAdmin ? (
          <AdminPanel state={state} dispatch={dispatch} />
        ) : student ? (
          <>
            {state.activeTab === "dashboard"    && <Dashboard student={student} notifications={state.notifications} dispatch={dispatch} />}
            {state.activeTab === "marks"        && <MarksView student={student} />}
            {state.activeTab === "cgpa"         && <CGPAView student={student} />}
            {state.activeTab === "attendance"   && <AttendanceView student={student} />}
            {state.activeTab === "history"      && <HistoryView student={student} />}
            {state.activeTab === "timetable"    && <TimetableView />}
            {state.activeTab === "gpa-calc"     && <GPACalcView />}
            {state.activeTab === "revaluation"  && <RevalView student={student} revRequests={state.revRequests} dispatch={dispatch} />}
            {state.activeTab === "transcript"   && <TranscriptView student={student} />}
            {state.activeTab === "ai-assistant" && <AIAssistantView student={student} />}
            {state.activeTab === "notifications"&& <NotifsView notifications={state.notifications} userId={student.id} dispatch={dispatch} />}
            {state.activeTab === "profile"      && <ProfileView student={student} dispatch={dispatch} />}
          </>
        ) : null}
      </div>
    </div>
  );
}
