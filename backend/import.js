require('dotenv').config(); // ⭐ VERY IMPORTANT

const fs = require('fs');
const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log("✅ Connected to Railway DB");

    const sql = fs.readFileSync('./health_advier.sql', 'utf8');

    await connection.query(sql);

    console.log("🎉 Database imported successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Import error:", err);
  }
})();