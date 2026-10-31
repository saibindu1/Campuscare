
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "campuscare_project_db",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const connection = await db.getConnection();

        console.log("MySQL connected successfully!");
        console.log("Database: campuscare_project_db");

        connection.release();
    } catch (error) {
        console.log("Database connection failed:", error.message);
    }
}

testConnection();

module.exports = db;
