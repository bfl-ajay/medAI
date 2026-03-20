require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const diseaseRoutes = require('./routes/diseaseRoutes');


const app = express();

app.use(cors({
    origin: [
        'https://med-ai-f25g.vercel.app',
        'http://localhost:4200',
        'http://localhost:5000'
    ],
    credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log("Incoming:", req.method, req.url);
    next();
});

// ensure database has expected tables
require('./db');

app.use('/api/auth', authRoutes);
app.use('/api/diseases', diseaseRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Health Adviser API');
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {

});


