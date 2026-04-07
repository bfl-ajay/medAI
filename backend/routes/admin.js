const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// 🔥 ADMIN CHECK MIDDLEWARE
const adminAuth = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access only" });
    }
    next();
};

// 📊 STATS
router.get('/stats', authMiddleware, adminAuth, async (req, res) => {
    try {
        const [[users]] = await db.execute(`SELECT COUNT(*) as total FROM users`);
        const [[reports]] = await db.execute(`SELECT COUNT(*) as total FROM medical_reports`);
        const [[prescriptions]] = await db.execute(`SELECT COUNT(*) as total FROM prescriptions`);
        const [[payments]] = await db.execute(`SELECT COUNT(*) as total FROM payments`);

        res.json({
            users: users.total,
            reports: reports.total,
            prescriptions: prescriptions.total,
            payments: payments.total
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👥 USERS
router.get('/users', authMiddleware, adminAuth, async (req, res) => {
    const [rows] = await db.execute(
        `SELECT id, name, email, role, created_at FROM users`
    );
    res.json(rows);
});

// 💊 PRESCRIPTIONS
router.get('/prescriptions', authMiddleware, adminAuth, async (req, res) => {
    const [rows] = await db.execute(`
    SELECT p.*, u.name as user_name
    FROM prescriptions p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.uploaded_at DESC
  `);

    res.json(rows);
});

// 💳 PAYMENTS
router.get('/payments', authMiddleware, adminAuth, async (req, res) => {
    const [rows] = await db.execute(`
    SELECT p.*, u.name as user_name
    FROM payments p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `);

    res.json(rows);
});
router.get('/reports', authMiddleware, adminAuth, async (req, res) => {
    const [rows] = await db.execute(`
    SELECT r.*, u.name as user_name
    FROM medical_reports r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.id DESC
  `);

    res.json(rows);
});

router.get('/bp-records', authMiddleware, adminAuth, async (req, res) => {
    const [rows] = await db.execute(`
    SELECT b.*, u.name as user_name
    FROM blood_pressure_records b
    JOIN users u ON b.user_id = u.id
    ORDER BY b.id DESC
  `);

    res.json(rows);
});

router.get('/additional-info', authMiddleware, adminAuth, async (req, res) => {
    const [rows] = await db.execute(`
    SELECT a.*, u.name as user_name
    FROM user_additional_info a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.id DESC
  `);

    res.json(rows);
});

router.get('/contacts', authMiddleware, adminAuth, async (req, res) => {
    const [rows] = await db.execute(`
    SELECT * FROM contact_messages
    ORDER BY id DESC
  `);

    res.json(rows);
});


router.delete('/user/:id', authMiddleware, adminAuth, async (req, res) => {
    try {
        await db.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    console.log("DELETE HIT:", req.params.id);
});
module.exports = router;