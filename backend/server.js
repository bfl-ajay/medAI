require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const diseaseRoutes = require('./routes/diseaseRoutes');


const app = express();

app.use(cors({
    origin: 'med-ai-f25g.vercel.app',
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
const pool = require('./db'); 

app.get('/import-db', async (req, res) => {
  try {
    const sql = fs.readFileSync('./health_advier.sql', 'utf8');

    await pool.query(sql);

    res.send("✅ Database imported successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Import failed");
  }
});