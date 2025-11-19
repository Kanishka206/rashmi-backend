require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// DB CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

db.connect(err => {
  if (err) console.log("❌ DB Error:", err);
  else console.log("✅ Connected to DB");
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));


/* ------------------------------------------------
   ✅ 1) AREA CRUD
------------------------------------------------ */

app.get("/area", (req, res) => {
  db.query("SELECT * FROM area", (err, result) => {
    if (err) return res.json({ error: err });
    res.json(result);
  });
});

/* ------------------------------------------------
   ✅ 2) CHEQUESTATUS CRUD
------------------------------------------------ */

app.get("/chequestatus", (req, res) => {
  db.query("SELECT * FROM chequestatus", (err, result) => {
    if (err) return res.json({ error: err });
    res.json(result);
  });
});

/* ------------------------------------------------
   ✅ 3) CHEQUES with JOINED STATUS
------------------------------------------------ */

app.get("/cheques", (req, res) => {
  const sql = `
    SELECT 
      c.cheque_id,
      c.client_shop_name,
      c.cheque_number,
      c.cheque_amount,
      c.issue_date,
      c.bank_date,
      s.status AS chequestatus_name
    FROM cheques c
    LEFT JOIN chequestatus s
      ON c.chequestatus_id = s.id
    ORDER BY c.cheque_id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.json({ error: err });
    }
    res.json(result);
  });
});

/* ------------------------------------------------
   ✅ START SERVER
------------------------------------------------ */
app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});

/* ------------------------------------------------
   ✅ COLLECTIONS ROUTE
------------------------------------------------ */
app.get("/collections", (req, res) => {
  const q = `
    SELECT 
      c.collection_id,
      c.client_shop_name,
      c.amount_collected,
      c.type,
      c.collection_date,
      c.area_id,
      c.weeklytraget_id,
      a.area AS area_name
    FROM collections c
    LEFT JOIN area a ON c.area_id = a.area_id
    ORDER BY c.collection_id DESC
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.json({ error: err });
    }
    res.json(data);
  });
});

/* ------------------------------------------------
   ✅ LOANS API
------------------------------------------------ */
app.get("/loans", (req, res) => {
  const q = `
    SELECT 
      l.loan_id,
      l.client_shop_name,
      l.loan_amount,
      l.amount_collected,
      l.remaining_amount,
      l.issue_date,
      l.due_date,
      l.status,
      l.notes,
      l.area_id,
      a.area AS area_name
    FROM loans l
    LEFT JOIN area a ON l.area_id = a.area_id
    ORDER BY l.loan_id DESC
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.json({ error: err });
    }
    res.json(data);
  });
});

// ✅ AREA API
app.get("/api/area", (req, res) => {
  const sql = "SELECT area_id, area FROM area ORDER BY area_id ASC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ DB Error:", err);
      res.status(500).json({ error: err });
    } else {
      res.json(results);
    }
  });
});

/* ------------------------------------------------
   ✅ WEEKLY TARGET API
------------------------------------------------ */
app.get("/api/weeklytraget", (req, res) => {
  const query = `
    SELECT 
      w.id,
      w.traget, 
      w.area_id,
      a.area AS area_name,
      w.week_start_date,
      w.week_end_date
    FROM weeklytraget w
    LEFT JOIN area a ON w.area_id = a.area_id
    ORDER BY w.id DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.json(result);
  });
});

