const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "casinoDB",
});

function createTableIfNotExists() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS account (
        login VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0
        );
    `;

    connection.query(createTableQuery, (err, results) => {
        if (err) {
        console.error('Error creating table:', err);
        return;
        }
        console.log('Table "account" is ready or already exists.');
    });
}

createTableIfNotExists();

app.listen(5001, () => {
  console.log("Backend server runs on http://localhost:5001");
});
