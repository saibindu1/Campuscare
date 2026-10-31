
import { useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);

  const [page, setPage] = useState("Dashboard");
  const [authPage, setAuthPage] = useState("login");

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    role: "student"
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "student",
    department: "CSE"
  });

  const [loginError, setLoginError] = useState("");
  const [message, setMessage] = useState("");

  const [complaints, setComplaints] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [trackedComplaint, setTrackedComplaint] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "Computer / IT",
    location: "",
    description: "",
    priority: "Medium",
    department: "CSE"
  });

  // LOGIN FORM CHANGES

  function handleLoginChange(event) {
    setLoginForm({
      ...loginForm,
      [event.target.name]: event.target.value
    });
  }

  // REGISTRATION FORM CHANGES

  function handleRegisterChange(event) {
    setRegisterForm({
      ...registerForm,
      [event.target.name]: event.target.value
    });
  }

  // CREATE ACCOUNT

  function handleRegister(event) {
    event.preventDefault();

    const name = registerForm.name.trim();
    const username = registerForm.username.trim();

    if (!name || !username || !registerForm.password) {
      setLoginError("Please fill in all required fields.");
      return;
    }

    if (registerForm.password.length < 6) {
      setLoginError("Password must contain at least 6 characters.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setLoginError("Passwords do not match.");
      return;
    }

    const alreadyExists = users.some(
      (item) =>
        item.username.toLowerCase() === username.toLowerCase()
    );

    if (alreadyExists) {
      setLoginError("This username already exists. Choose another.");
      return;
    }

    const newUser = {
      name,
      username,
      password: registerForm.password,
      role: registerForm.role,
      department: registerForm.department
    };

    setUsers((previous) => [...previous, newUser]);

    setLoginForm({
      username,
      password: "",
      role: registerForm.role
    });

    setRegisterForm({
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "student",
      department: "CSE"
    });

    setLoginError("");
    setMessage("Account created successfully! Please log in.");
    setAuthPage("login");
  }

  // LOGIN

  function handleLogin(event) {
    event.preventDefault();

    const account = users.find(
      (item) =>
        item.username.toLowerCase() ===
          loginForm.username.trim().toLowerCase() &&
        item.password === loginForm.password &&
        item.role === loginForm.role
    );

    if (!account) {
      setLoginError(
        "Account not found or credentials are incorrect. Please register first."
      );
      return;
    }

    setUser(account);
    setPage("Dashboard");
    setLoginError("");
    setMessage("");
    setTrackedComplaint(null);
    setSearchId("");
    setLoginForm({
      username: "",
      password: "",
      role: "student"
    });
  }

  // LOGOUT

  function handleLogout() {
    setUser(null);
    setPage("Dashboard");
    setAuthPage("login");
    setMessage("");
    setLoginError("");
    setTrackedComplaint(null);
    setSearchId("");
    setForm({
      title: "",
      category: "Computer / IT",
      location: "",
      description: "",
      priority: "Medium",
      department: "CSE"
    });
  }

  // COMPLAINT FORM

  function handleFormChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  // ASSIGN DEPARTMENT BASED ON CATEGORY

  function getDepartment(category) {
    if (category === "Computer / IT") return "CSE";
    if (category === "Electrical") return "EEE";
    if (category === "Plumbing") return "General";
    if (category === "Cleanliness") return "General";
    if (category === "Classroom Equipment") return "General";
    return "General";
  }

  // SUBMIT COMPLAINT

  function submitComplaint(event) {
    event.preventDefault();

    const nextNumber =
      complaints.reduce((max, item) => {
        const number = Number(item.ticketId.split("-").pop());
        return Math.max(max, number);
      }, 0) + 1;

    const ticketId =
      "CAMP-2026-" + String(nextNumber).padStart(3, "0");

    const newComplaint = {
      ticketId,
      username: user.username,
      studentName: user.name,
      title: form.title,
      category: form.category,
      location: form.location,
      description: form.description,
      priority: form.priority,
      department: form.department || getDepartment(form.category),
      status: "Submitted",
      facultyRemark: "Waiting for faculty review.",
      history: [
        {
          status: "Submitted",
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })
        }
      ]
    };

    setComplaints((previous) => [newComplaint, ...previous]);

    setMessage(
      "Complaint submitted successfully! Your ticket ID is " + ticketId
    );

    setForm({
      title: "",
      category: "Computer / IT",
      location: "",
      description: "",
      priority: "Medium",
      department: "CSE"
    });

    setPage("Dashboard");
  }

  // FACULTY STATUS UPDATE

  function updateComplaint(ticketId, newStatus, remark) {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    setComplaints((previous) =>
      previous.map((item) => {
        if (item.ticketId !== ticketId) return item;

        const lastEntry = item.history[item.history.length - 1];

        const updatedHistory =
          lastEntry && lastEntry.status === newStatus
            ? item.history
            : [
                ...item.history,
                { status: newStatus, date: today }
              ];

        return {
          ...item,
          status: newStatus,
          facultyRemark: remark,
          history: updatedHistory
        };
      })
    );

    setTrackedComplaint((previous) =>
      previous && previous.ticketId === ticketId
        ? {
            ...previous,
            status: newStatus,
            facultyRemark: remark,
            history:
              previous.history[previous.history.length - 1]?.status ===
              newStatus
                ? previous.history
                : [
                    ...previous.history,
                    { status: newStatus, date: today }
                  ]
          }
        : previous
    );

    setMessage("Complaint status updated successfully.");
  }

  // COMPLAINT VISIBILITY

  const visibleComplaints =
    user?.role === "faculty"
      ? complaints.filter(
          (item) => item.department === user.department
        )
      : complaints.filter(
          (item) => item.username === user?.username
        );

  const pending = visibleComplaints.filter(
    (item) => item.status !== "Resolved"
  ).length;

  const resolved = visibleComplaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  // TRACK COMPLAINT

  function trackComplaint(event) {
    event.preventDefault();

    const result = complaints.find(
      (item) =>
        item.ticketId.toLowerCase() ===
          searchId.trim().toLowerCase() &&
        (
          user.role === "faculty"
            ? item.department === user.department
            : item.username === user.username
        )
    );

    setTrackedComplaint(result || null);
    setMessage(
      result
        ? ""
        : "Complaint not found or you do not have access to it."
    );
  }

  function openTracking(item) {
    setSearchId(item.ticketId);
    setTrackedComplaint(item);
    setPage("Track Complaint");
    setMessage("");
  }

  // LOGIN AND REGISTRATION SCREENS

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-decoration">
          <div className="login-brand">
            <div className="brand-icon">C</div>
            <span>CampusCare</span>
          </div>

          <div className="login-intro">
            <span className="welcome-label">
              CAMPUS ISSUE MANAGEMENT
            </span>

            <h1>A better campus starts with you.</h1>

            <p>
              Report campus problems, connect with the right department,
              and track every update in one place.
            </p>

            <div className="login-feature">
              <span>✓</span>
              Simple complaint reporting
            </div>

            <div className="login-feature">
              <span>✓</span>
              Transparent progress tracking
            </div>

            <div className="login-feature">
              <span>✓</span>
              Dedicated faculty dashboard
            </div>
          </div>

          <p className="login-footer">
            CampusCare · Campus Issue Reporting System
          </p>
        </div>

        <div className="login-content">
          {authPage === "login" ? (
            <form className="login-card" onSubmit={handleLogin}>
              <div className="login-mobile-brand">
                <div className="brand-icon">C</div>
                <span>CampusCare</span>
              </div>

              <span className="form-eyebrow">WELCOME BACK</span>

              <h2>Sign in to your account</h2>

              <p className="muted">
                Enter the username and password you registered with.
              </p>

              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}

              <label htmlFor="login-role">Login as</label>

              <select
                id="login-role"
                name="role"
                value={loginForm.role}
                onChange={handleLoginChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>

              <label htmlFor="login-username">Username</label>

              <input
                id="login-username"
                name="username"
                value={loginForm.username}
                onChange={handleLoginChange}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />

              <label htmlFor="login-password">Password</label>

              <input
                id="login-password"
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              {loginError && (
                <div className="error-message">
                  {loginError}
                </div>
              )}

              <button className="login-button" type="submit">
                Sign In <span>→</span>
              </button>

              <div className="auth-switch">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthPage("register");
                    setLoginError("");
                    setMessage("");
                  }}
                >
                  Create Account
                </button>
              </div>
            </form>
          ) : (
            <form className="login-card" onSubmit={handleRegister}>
              <div className="login-mobile-brand">
                <div className="brand-icon">C</div>
                <span>CampusCare</span>
              </div>

              <span className="form-eyebrow">JOIN CAMPUSCARE</span>

              <h2>Create your account</h2>

              <p className="muted">
                Choose your own username and password.
              </p>

              <label htmlFor="register-name">Full name</label>

              <input
                id="register-name"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />

              <label htmlFor="register-role">Account type</label>

              <select
                id="register-role"
                name="role"
                value={registerForm.role}
                onChange={handleRegisterChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>

              <label htmlFor="register-department">Department</label>

              <select
                id="register-department"
                name="department"
                value={registerForm.department}
                onChange={handleRegisterChange}
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="General">General Maintenance</option>
              </select>

              <label htmlFor="register-username">Create username</label>

              <input
                id="register-username"
                name="username"
                value={registerForm.username}
                onChange={handleRegisterChange}
                placeholder="Choose any username"
                autoComplete="username"
                required
              />

              <label htmlFor="register-password">Create password</label>

              <input
                id="register-password"
                name="password"
                type="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />

              <label htmlFor="confirm-password">Confirm password</label>

              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="Enter password again"
                autoComplete="new-password"
                required
              />

              {loginError && (
                <div className="error-message">
                  {loginError}
                </div>
              )}

              <button className="login-button" type="submit">
                Create Account <span>→</span>
              </button>

              <div className="auth-switch">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthPage("login");
                    setLoginError("");
                    setMessage("");
                  }}
                >
                  Sign In
                </button>
              </div>

              <p className="registration-note">
                Demo mode: registration is temporary. Faculty accounts
                require backend authorization in the real application.
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // LOGGED-IN APPLICATION

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h2>CampusCare</h2>
            <p>Issue Management</p>
          </div>
        </div>

        <p className="menu-heading">WORKSPACE</p>

        {[
          { name: "Dashboard", icon: "▦" },
          ...(user.role === "student"
            ? [{ name: "Report an Issue", icon: "＋" }]
            : []),
          { name: "Track Complaint", icon: "◷" }
        ].map((item) => (
          <button
            key={item.name}
            className={
              "menu-item " +
              (page === item.name ? "active" : "")
            }
            onClick={() => {
              setPage(item.name);
              setMessage("");
              if (item.name === "Track Complaint") {
                setSearchId("");
                setTrackedComplaint(null);
              }
            }}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="avatar">
            {user.role === "student" ? "S" : "F"}
          </div>

          <div className="user-info">
            <strong>{user.name}</strong>
            <p>
              {user.role === "student" ? "Student" : "Faculty"} ·{" "}
              {user.department}
            </p>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Log out"
          >
            ↪
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">CAMPUS MANAGEMENT SYSTEM</p>
            <h1>{page}</h1>
          </div>

          <div className="profile-chip">
            <div className="profile-avatar">
              {user.role === "student" ? "S" : "F"}
            </div>
            <div>
              <strong>{user.name}</strong>
              <p>
                {user.role === "student"
                  ? "Student Portal"
                  : "Faculty Portal"}
              </p>
            </div>
            <button
              className="top-logout"
              onClick={handleLogout}
              title="Log out"
            >
              ↪
            </button>
          </div>
        </header>

        {message && (
          <div className="message">
            <span>{message}</span>
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {page === "Dashboard" && (
          <>
            <section className="welcome">
              <div>
                <p className="welcome-label">
                  {user.role === "student"
                    ? "STUDENT WORKSPACE"
                    : "FACULTY WORKSPACE"}
                </p>

                <h2>
                  {user.role === "student"
                    ? "Your voice can improve our campus."
                    : "Make every campus issue count."}
                </h2>

                <p>
                  {user.role === "student"
                    ? "Submit complaints and follow their progress."
                    : "Review assigned complaints and update their status."}
                </p>

                {user.role === "student" && (
                  <button
                    className="primary-button light-button"
                    onClick={() => {
                      setPage("Report an Issue");
                      setMessage("");
                    }}
                  >
                    + Report an Issue
                  </button>
                )}
              </div>

              <div className="welcome-art">🏫</div>
            </section>

            <section className="stats">
              <div className="stat-card">
                <div className="stat-icon emerald">▤</div>
                <p>Total Complaints</p>
                <h2>{visibleComplaints.length}</h2>
                <span>Complaints in your workspace</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber">◷</div>
                <p>Open Issues</p>
                <h2>{pending}</h2>
                <span>Awaiting resolution</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon mint">✓</div>
                <p>Resolved Issues</p>
                <h2>{resolved}</h2>
                <span>Successfully completed</span>
              </div>
            </section>

            <section className="section-heading">
              <div>
                <h2>
                  {user.role === "student"
                    ? "My Complaints"
                    : "Department Complaints"}
                </h2>
                <p>
                  {user.role === "student"
                    ? "View the complaints you have submitted."
                    : "Review complaints assigned to your department."}
                </p>
              </div>

              {user.role === "student" && (
                <button
                  className="secondary-button"
                  onClick={() => setPage("Report an Issue")}
                >
                  + New Complaint
                </button>
              )}
            </section>

            <div className="table-card">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>TICKET ID</th>
                      {user.role === "faculty" && <th>STUDENT</th>}
                      <th>ISSUE</th>
                      <th>LOCATION</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleComplaints.map((item) => (
                      <tr key={item.ticketId}>
                        <td className="tracking-id">
                          {item.ticketId}
                        </td>

                        {user.role === "faculty" && (
                          <td>{item.studentName}</td>
                        )}

                        <td>{item.title}</td>
                        <td>{item.location}</td>

                        <td>
                          <span
                            className={
                              "status " +
                              item.status
                                .toLowerCase()
                                .replaceAll(" ", "-")
                            }
                          >
                            {item.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="text-button"
                            onClick={() => openTracking(item)}
                          >
                            {user.role === "faculty"
                              ? "Update / View"
                              : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {visibleComplaints.length === 0 && (
                      <tr>
                        <td
                          colSpan={user.role === "faculty" ? 6 : 5}
                          className="empty-state"
                        >
                          No complaints found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {page === "Report an Issue" && user.role === "student" && (
          <section className="form-card">
            <h2>Submit a New Complaint</h2>

            <p className="muted">
              Provide accurate details so the right department can help.
            </p>

            <form onSubmit={submitComplaint}>
              <label htmlFor="title">Issue title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. Projector not working"
                required
              />

              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={(event) => {
                  const category = event.target.value;
                  setForm({
                    ...form,
                    category,
                    department: getDepartment(category)
                  });
                }}
              >
                <option>Computer / IT</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Classroom Equipment</option>
                <option>Cleanliness</option>
                <option>Other</option>
              </select>

              <label htmlFor="department">Assigned department</label>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleFormChange}
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="General">General Maintenance</option>
              </select>

              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleFormChange}
                placeholder="Building, room or lab"
                required
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Describe the problem"
                rows="4"
                required
              />

              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleFormChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <button
                className="primary-button form-submit"
                type="submit"
              >
                Submit Complaint
              </button>
            </form>
          </section>
        )}

        {page === "Track Complaint" && (
          <section className="track-section">
            <div className="form-card">
              <h2>
                {user.role === "faculty"
                  ? "Review Department Complaints"
                  : "Track Your Complaint"}
              </h2>

              <p className="muted">
                Enter the ticket ID to view complaint details and progress.
              </p>

              <form className="track-form" onSubmit={trackComplaint}>
                <input
                  value={searchId}
                  onChange={(event) => setSearchId(event.target.value)}
                  placeholder="e.g. CAMP-2026-001"
                  required
                />

                <button className="primary-button" type="submit">
                  Find Ticket
                </button>
              </form>
            </div>

            {trackedComplaint && (
              <div className="form-card tracking-result">
                <div className="result-header">
                  <div>
                    <p className="muted">TICKET ID</p>
                    <h2 className="tracking-id">
                      {trackedComplaint.ticketId}
                    </h2>
                  </div>

                  <span
                    className={
                      "status " +
                      trackedComplaint.status
                        .toLowerCase()
                        .replaceAll(" ", "-")
                    }
                  >
                    {trackedComplaint.status}
                  </span>
                </div>

                <div className="details-grid">
                  <div>
                    <span>Issue</span>
                    <strong>{trackedComplaint.title}</strong>
                  </div>

                  <div>
                    <span>Student</span>
                    <strong>{trackedComplaint.studentName}</strong>
                  </div>

                  <div>
                    <span>Category</span>
                    <strong>{trackedComplaint.category}</strong>
                  </div>

                  <div>
                    <span>Department</span>
                    <strong>{trackedComplaint.department}</strong>
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>{trackedComplaint.location}</strong>
                  </div>

                  <div>
                    <span>Priority</span>
                    <strong>{trackedComplaint.priority}</strong>
                  </div>

                  <div className="full-detail">
                    <span>Description</span>
                    <strong>{trackedComplaint.description}</strong>
                  </div>

                  <div className="full-detail">
                    <span>Faculty Remark</span>
                    <strong>
                      {trackedComplaint.facultyRemark ||
                        "No remarks yet."}
                    </strong>
                  </div>
                </div>

                {user.role === "faculty" && (
                  <FacultyUpdate
                    key={trackedComplaint.ticketId}
                    complaint={trackedComplaint}
                    onUpdate={updateComplaint}
                  />
                )}

                <h3>Complaint History</h3>

                <div className="timeline">
                  {trackedComplaint.history.map((entry, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-dot"></div>

                      <div>
                        <strong>{entry.status}</strong>
                        <p>{entry.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function FacultyUpdate({ complaint, onUpdate }) {
  const [status, setStatus] = useState(complaint.status);
  const [remark, setRemark] = useState(
    complaint.facultyRemark || ""
  );

  function handleSubmit(event) {
    event.preventDefault();
    onUpdate(complaint.ticketId, status, remark);
  }

  return (
    <form className="faculty-update" onSubmit={handleSubmit}>
      <h3>Faculty Status Update</h3>

      <label htmlFor="newStatus">Complaint status</label>
      <select
        id="newStatus"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option>Submitted</option>
        <option>In Progress</option>
        <option>Resolved</option>
      </select>

      <label htmlFor="remark">Faculty remark</label>
      <textarea
        id="remark"
        value={remark}
        onChange={(event) => setRemark(event.target.value)}
        placeholder="Enter an update for the student"
        rows="3"
        required
      />

      <button className="primary-button" type="submit">
        Save Status Update
      </button>
    </form>
  );
}

export default App;
