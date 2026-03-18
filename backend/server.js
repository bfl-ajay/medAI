require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const diseaseRoutes = require('./routes/diseaseRoutes');


const app = express();

app.use(cors({
    origin: 'https://med-ai-f25g.vercel.app',
    credentials: true
})); 
app.use(express.json());

// ensure database has expected tables
require('./db');

app.use('/api/auth', authRoutes);
app.use('/api/diseases', diseaseRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Health Adviser API');
});
app.use('/uploads', express.static('uploads'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {

});



const fs = require('fs');
const path = require('path');
const pool = require('./db');

app.get('/import-db', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'health_advier.sql');
    console.log("📂 File path:", filePath);

    const sql = fs.readFileSync(filePath, 'utf8');

    await pool.query(sql);

    res.send("✅ Database imported successfully");
  } catch (err) {
    console.error("🔥 IMPORT ERROR:", err);

    res.status(500).send(`
      ❌ Import failed <br><br>
      ERROR: ${err.message}
    `);
  }
});