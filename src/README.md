Step 1: Install the Required Software
Install the following:
- Visual Studio Code
- Node.js and npm
- XAMPP (for MySQL and phpMyAdmin)
- Postman (optional, for testing APIs)
Verify Node.js and npm in the VS Code terminal:
node -v
npm -v


Step 2: Create the Project Folder
Create a folder named CampusCare and open it in VS Code.

The project structure will look like this:
CampusCare/
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── App.css
└── backend/
    ├── server.js
    ├── db.js
    └── package.json


Step 3: Create the React Frontend
Open a terminal in the main CampusCare folder and run:
npm create vite@latest frontend


Choose React and JavaScript when prompted. Then run:
cd frontend
npm install


Step 4: Configure App.jsx
Open frontend/src/App.jsx and use your supplied CampusCare React code.

The important starting lines are:
import { useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";


- useState manages changing interface data.
- App.css provides the application's design.
- API_BASE specifies the backend address.
Your complete App.jsx contains the registration, login, dashboard, complaint submission, and complaint tracking interface. Keep your original component code for these features.
Step 5: Configure App.css
Open frontend/src/App.css and paste the CSS you supplied for CampusCare.

This file controls the appearance of the application, including page layout, forms, buttons, dashboards, complaint lists, and other interface elements.

Start the frontend using:
npm run dev


Open the local URL shown in the terminal, usually http://localhost:5173.
Step 6: Create the Backend Folder
Return to the main CampusCare folder and open a second terminal. Run:
mkdir backend
cd backend
npm init -y


Install the required packages:
npm install express cors mysql2 bcryptjs


These packages handle API requests, frontend-backend communication, database operations, and password hashing.
Step 7: Create db.js
Inside the backend folder, create a file named db.js.

Add the database connection code:
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "campuscare-newdb",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("MySQL connected successfully!");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

testConnection();

module.exports = db;


Note: This example assumes your MySQL root password is blank. If you have configured a password, enter it in the password field.
Step 8: Create server.js
Create a file named server.js inside backend.

The main server setup is:
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Add your complete CampusCare API routes here.

app.listen(PORT, () => {
  console.log(
    `CampusCare server running at http://localhost:${PORT}`
  );
});


Important: This is only the server setup, not the complete backend. Keep the full server.js code you supplied, including all its API routes and database queries. Do not replace your complete code with this short example.
Step 9: Create the MySQL Database and Tables
Start MySQL in XAMPP. Open http://localhost/phpmyadmin, select the SQL tab, and execute the following query.
CREATE DATABASE IF NOT EXISTS `campuscare-newdb`;
USE `campuscare-newdb`;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    student_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty') NOT NULL DEFAULT 'student',
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    department VARCHAR(100),
    status ENUM('Submitted', 'In Progress', 'Resolved')
        DEFAULT 'Submitted',
    faculty_remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaint_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    remark TEXT,
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id)
        REFERENCES complaints(id)
        ON DELETE CASCADE
);


The three tables store:
- users — registration details, login information, role, and department.
- complaints — complaint details, ticket ID, priority, status, and faculty remarks.
- complaint_history — status changes and remarks associated with a complaint.
Step 10: Start the Backend Server
Ensure XAMPP MySQL is running. In the backend terminal, run:
node server.js


Expected terminal messages include:
MySQL connected successfully!
CampusCare server running at http://localhost:5000


The exact messages depend on your db.js and server.js code.
Step 11: Connect the Frontend to the Backend
In App.jsx, the API address is:
const API_BASE = "http://localhost:5000";


A reusable API helper can send requests to the backend:
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}


This helper sends HTTP requests, converts JSON responses into JavaScript data, and reports unsuccessful requests. Keep your original helper if it contains additional error handling.
Step 12: Understand the Application Flow
Student / Faculty

Uses the CampusCare interface

React Frontend

App.jsx and App.css

Node.js + Express Backend

server.js processes API requests

MySQL Database

campuscare-newdb stores application data


When a student submits a complaint, the frontend sends its details as JSON. Express processes the request, the database query saves the details, and the backend sends a response to the frontend.
Step 13: Identify the Important API Endpoints
Your CampusCare backend uses these endpoints:
Method	Endpoint	Purpose
POST	/api/register	Register a student or faculty member
POST	/api/login	Verify login credentials
GET	/api/users	Retrieve user information
GET	/api/complaints	Retrieve complaints
POST	/api/complaints	Submit a complaint
GET	/api/complaints/:ticketId	Find a complaint using its ticket ID
PUT	/api/complaints/:ticketId	Update complaint information or status

For example, the frontend can submit a complaint to:
apiRequest("/api/complaints", {
  method: "POST",
  body: JSON.stringify(complaintDetails),
});


Here, complaintDetails represents the complaint data collected by your React form. Its field names must match those expected by your backend.
Step 14: Test the Registration API
Open Postman and select POST. Enter this URL:
http://localhost:5000/api/register


Choose Body → raw → JSON and enter an example request:
{
  "username": "student1",
  "studentName": "Suresh",
  "email": "student1@example.com",
  "password": "example123",
  "role": "student",
  "department": "CSE"
}


Click Send.

The backend should validate the request, hash the password using bcryptjs, and store the user details in the users table. The exact response depends on your implementation.
Step 15: Test the Login Feature
Use the following endpoint:
POST http://localhost:5000/api/login


Example request body:
{
  "username": "student1",
  "password": "example123"
}


The backend verifies the supplied credentials against the stored account. A successful login allows the user to access the relevant application features.
Step 16: Test Complaint Submission
Use the endpoint:
POST http://localhost:5000/api/complaints


The complaint form collects information such as:
- Complaint title
- Category
- Location
- Description
- Priority
- Department
The backend validates the submitted details and stores the complaint in the complaints table. It can also create a corresponding entry in complaint_history and return a ticket ID.
Step 17: Test Complaint Tracking
Use the following endpoint, replacing the example ticket ID with an actual ticket ID returned by your application:
GET http://localhost:5000/api/complaints/CAMP-2026-123456


The backend retrieves the matching complaint so the user can check its details and status.

The complaint status may be:
- Submitted
- In Progress
- Resolved
These are the status values defined in your database schema.
Step 18: Test Complaint Updates
Use this endpoint:
PUT http://localhost:5000/api/complaints/CAMP-2026-123456


Send the status and faculty remark fields expected by your backend.

Example body:
{
  "status": "In Progress",
  "facultyRemark": "The issue is being investigated."
}


This is an example request; the exact property names must match your server.js implementation.

After the update, verify the complaint's new status and any history entry in phpMyAdmin.
Step 19: Run and Test the Complete Application
Keep two terminals running in VS Code.

Terminal 1 — Frontend
cd frontend
npm run dev


Terminal 2 — Backend
cd backend
node server.js


Then test the following:
1. Register a new account.
2. Log in using the account.
3. Submit a campus complaint.
4. Check the complaints table in phpMyAdmin.
5. Track the complaint using its ticket ID.
6. Update the complaint status.
7. Check the complaint_history table, if history recording is enabled in your backend.
Step 20: Verify the Final Output
Confirm that:
- The CampusCare interface opens in the browser.
- Registration and login work correctly.
- Complaint details are saved in MySQL.
- Every complaint can be identified using its ticket ID.
- Users can track complaint status.
- Authorized users can update complaints according to the application's logic.
- Errors are handled appropriately by the frontend and backend.
Result: The CampusCare – Campus Issue Management System connects a React frontend with a Node.js and Express backend and a MySQL database. It provides user registration, login, complaint submission, complaint tracking, and status management.


































