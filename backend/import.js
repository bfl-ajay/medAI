app.get('/import-db', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(__dirname, 'health_advier.sql');
    console.log("📂 File path:", filePath);

    const sql = fs.readFileSync(filePath, 'utf8');

    const [result] = await pool.query(sql);

    res.send("✅ Database imported successfully");
  } catch (err) {
    console.error("🔥 IMPORT ERROR:", err);

    res.status(500).send(`
      ❌ Import failed <br><br>
      ERROR: ${err.message}
    `);
  }
});