
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db0");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// HOME ROUTE
// --------------------------------------------------

app.get("/", (req, res) => {
  res.send("CampusCare backend is running!");
});

// --------------------------------------------------
// REGISTER USER
// --------------------------------------------------
app.post("/api/register", async (req, res) => {
    try {
        console.log("Registration data received:", req.body);

        const { name, username, password, role, department } = req.body;

        if (!name || !username || !password || !role || !department) {
            return res.status(400).json({
                message: "Please provide all required details."
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Username already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users
            (name, username, password, role, department)
            VALUES (?, ?, ?, ?, ?)`,
            [name, username, hashedPassword, role, department]
        );

        res.status(201).json({
            message: "Registration successful! Please login."
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: error.message
        });
    }
});

// --------------------------------------------------
// LOGIN USER
// --------------------------------------------------

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Enter username and password."
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ?",
            [username.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Username not found. Please register first."
            });
        }

        const user = rows[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Incorrect password."
            });
        }

        res.json({
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed: " + error.message
        });
    }
});

// --------------------------------------------------
// GET USERS
// --------------------------------------------------

app.get("/api/users", async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, student_name, email, role, department
       FROM users`
    );

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Unable to fetch users.",
    });
  }
});

// --------------------------------------------------
// GET COMPLAINTS
// Optional filters:
// /api/complaints?username=student1
// /api/complaints?department=CSE
// --------------------------------------------------

app.get("/api/complaints", async (req, res) => {
  try {
    const { username, department } = req.query;

    let sql = "SELECT * FROM complaints";
    const conditions = [];
    const values = [];

    if (username) {
      conditions.push("username = ?");
      values.push(username);
    }

    if (department) {
      conditions.push("department = ?");
      values.push(department);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY created_at DESC";

    const [complaints] = await db.query(sql, values);

    if (complaints.length === 0) {
      return res.json([]);
    }

    const complaintIds = complaints.map(
      (complaint) => complaint.id
    );

    const placeholders = complaintIds.map(() => "?").join(",");

    const [history] = await db.query(
      `SELECT complaint_id, status, remark, updated_by, created_at
       FROM complaint_history
       WHERE complaint_id IN (${placeholders})
       ORDER BY created_at ASC`,
      complaintIds
    );

    const result = complaints.map((complaint) => ({
      ...complaint,
      history: history
        .filter((item) => item.complaint_id === complaint.id)
        .map((item) => ({
          status: item.status,
          remark: item.remark,
          updatedBy: item.updated_by,
          createdAt: item.created_at,
        })),
    }));

    res.json(result);
  } catch (error) {
    console.error("Get complaints error:", error);

    res.status(500).json({
      message: "Unable to fetch complaints.",
    });
  }
});

// --------------------------------------------------
// POST A NEW COMPLAINT
// --------------------------------------------------

app.post("/api/complaints", async (req, res) => {
  let connection;

  try {
    const {
      username,
      studentName,
      title,
      category,
      location,
      description,
      priority,
      department,
    } = req.body;

    if (
      !username ||
      !studentName ||
      !title ||
      !category ||
      !location ||
      !description
    ) {
      return res.status(400).json({
        message: "Please provide all complaint details.",
      });
    }

    connection = await db.getConnection();

    await connection.beginTransaction();

    const ticketId =
      "CAMP-" +
      new Date().getFullYear() +
      "-" +
      Date.now();

    const [result] = await connection.query(
      `INSERT INTO complaints
      (
        ticket_id,
        username,
        student_name,
        title,
        category,
        location,
        description,
        priority,
        department,
        status,
        faculty_remark
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketId,
        username,
        studentName,
        title,
        category,
        location,
        description,
        priority || "Medium",
        department || null,
        "Submitted",
        "Waiting for faculty review.",
      ]
    );

    await connection.query(
      `INSERT INTO complaint_history
      (complaint_id, status, remark, updated_by)
      VALUES (?, ?, ?, ?)`,
      [
        result.insertId,
        "Submitted",
        "Complaint submitted successfully.",
        username,
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: "Complaint submitted successfully!",
      ticketId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Complaint submission error:", error);

    res.status(500).json({
      message: "Complaint submission failed.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// --------------------------------------------------
// GET ONE COMPLAINT USING TICKET ID
// --------------------------------------------------

app.get("/api/complaints/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;

    const [complaints] = await db.query(
      "SELECT * FROM complaints WHERE ticket_id = ?",
      [ticketId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    const complaint = complaints[0];

    const [history] = await db.query(
      `SELECT status, remark, updated_by, created_at
       FROM complaint_history
       WHERE complaint_id = ?
       ORDER BY created_at ASC`,
      [complaint.id]
    );

    res.json({
      ...complaint,
      history,
    });
  } catch (error) {
    console.error("Get complaint error:", error);

    res.status(500).json({
      message: "Unable to fetch complaint.",
    });
  }
});

// --------------------------------------------------
// UPDATE COMPLAINT STATUS
// --------------------------------------------------

app.put("/api/complaints/:ticketId", async (req, res) => {
  let connection;

  try {
    const { ticketId } = req.params;
    const { status, remark, updatedBy } = req.body;

    const allowedStatuses = [
      "Submitted",
      "In Progress",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid complaint status.",
      });
    }

    connection = await db.getConnection();

    await connection.beginTransaction();

    const [complaints] = await connection.query(
      "SELECT id FROM complaints WHERE ticket_id = ?",
      [ticketId]
    );

    if (complaints.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    const complaintId = complaints[0].id;

    await connection.query(
      `UPDATE complaints
       SET status = ?, faculty_remark = ?
       WHERE ticket_id = ?`,
      [status, remark || "", ticketId]
    );

    await connection.query(
      `INSERT INTO complaint_history
      (complaint_id, status, remark, updated_by)
      VALUES (?, ?, ?, ?)`,
      [
        complaintId,
        status,
        remark || "",
        updatedBy || "Faculty",
      ]
    );

    await connection.commit();

    res.json({
      message: "Complaint updated successfully!",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Update complaint error:", error);

    res.status(500).json({
      message: "Complaint update failed.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------


app.listen(PORT, () => {
    console.log(`CampusCare server running at http://localhost:${PORT}`);
});