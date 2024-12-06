const express = require("express");
const mysql = require("mysql2");
const bcrypt = require('bcryptjs');
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require('multer');

const SECRET_KEY = "my_secret_key"; // strong key for production

const app = express();

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors({
    origin: "http://localhost:3000", // front end addres
    methods: ["GET", "POST", "PUT", "DELETE"], // allow http
    credentials: true // for cookies and other
}));

app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'images'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// connect DB and create table
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
            balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
            profile_image VARCHAR(255) NOT NULL
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

/////////
///////// API endpoints
/////////

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; //  "Bearer <token>"
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.user = user;
        next();
    });
}

// REGISTRATION
app.post("/register", (req, res) => {
  const { login, password } = req.body;
  
  if (!login || !password) {
    return res.status(400).json({ message: "Login and password are required." });
  }

  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  const query = "INSERT INTO account (login, password, balance, profile_image) VALUES (?, ?, ?, ?)";
  connection.query(query, [login, hashedPassword, 0, "default.jpg"], (err, results) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "User already exists." });
      }
      console.error(err);
      return res.status(500).json({ message: "Server error." });
    }
    res.status(201).json({ message: "User registered successfully." });
  });
});

// LOGIN
app.post("/login", (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ message: "Login and password are required." });
    }

    const query = "SELECT * FROM account WHERE login = ?";
    connection.query(query, [login], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error." });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid login or password." });
        }

        const storedHash = results[0].password;
        const isPasswordCorrect = bcrypt.compareSync(password, storedHash);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid login or password." });
        }

        // JWT token
        const token = jwt.sign({ login, balance: results[0].balance }, SECRET_KEY, {
            expiresIn: "1h", // expiration
        });

        res.json({ token, message: "Login successful." });
    });
});

// Homepage
app.get("/home", authenticateToken, (req, res) => {
    const { login } = req.user;

    const query = "SELECT login, balance, profile_image FROM account WHERE login = ?";
    connection.query(query, [login], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const account = results[0];
        return res.json({
            account: {
                login: account.login,
                balance: account.balance,
                profileImage: `/images/${account.profile_image}`
            }
        });
    });
});

// upload profile pick
app.post("/upload-profile-image", authenticateToken, upload.single("profileImage"), (req, res) => {
    const { login } = req.user;
    const profileImage = req.file ? req.file.filename : null;

    if (!profileImage) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    const query = "UPDATE account SET profile_image = ? WHERE login = ?";
    connection.query(query, [profileImage, login], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error." });
        }

        res.json({
            profileImage: `/images/${profileImage}`
        });
    });
});

////////
//////// LISTEN
////////
app.listen(5001, () => {
    console.log("Backend server runs on http://localhost:5001");
});
