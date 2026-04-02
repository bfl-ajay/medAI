const cron = require('node-cron');
const db = require('../db');
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const MERCHANT_KEY = process.env.PAYU_KEY;
const SALT = process.env.PAYU_SALT;

cron.schedule('0 0 * * *', async () => {
    try {
        console.log("Running plan expiry check...");

        await db.query(`
            UPDATE users
            SET plan_type = 'free'
            WHERE plan_type = 'premium'
            AND plan_expires <= NOW()
        `);

        console.log("Expired users downgraded");
    } catch (err) {
        console.error("Cron error:", err);
    }
});


//  STEP 1: Generate PayU request + SAVE PENDING PAYMENT

router.post("/pay", authMiddleware, async (req, res) => {

    try {
        const userId = req.user.id;
        const { amount, name, email } = req.body;

        const [users] = await db.query(
            `SELECT plan_type, plan_expires FROM users WHERE id = ?`,
            [userId]
        );

        const user = users[0];

        if (
            user.plan_type === 'premium' &&
            user.plan_expires &&
            new Date(user.plan_expires) > new Date()
        ) {
            return res.status(400).json({
                message: "You already have an active premium plan"
            });
        }
        const [pending] = await db.query(
            `SELECT id FROM payments 
     WHERE user_id = ? AND status = 'pending'
     LIMIT 1`,
            [userId]
        );

        if (pending.length > 0) {
            await db.query(
                `UPDATE payments SET status = 'failed' WHERE user_id = ? AND status = 'pending'`,
                [userId]
            );
        }
        const txnid = "txn_" + Date.now();
        const productinfo = "Health Report";

        const udf1 = "";
        const udf2 = "";
        const udf3 = "";
        const udf4 = "";
        const udf5 = "";

        const hashString =
            `${MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${name}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${SALT}`;

        const hash = crypto
            .createHash("sha512")
            .update(hashString)
            .digest("hex");

        // 💾 SAVE PENDING PAYMENT
        await db.query(
            `INSERT INTO payments (user_id, txn_id, amount, status, payment_gateway)
             VALUES (?, ?, ?, ?, ?)`,
            [
                req.user.id,
                txnid,
                amount,
                'pending',
                'PayU'
            ]
        );

        res.json({
            key: MERCHANT_KEY,
            txnid,
            amount,
            productinfo,
            firstname: name,
            email,
            phone: "9999999999",
            hash,
            action: "https://test.payu.in/_payment",
            surl: "http://localhost:5000/api/payment/success",
            furl: "http://localhost:5000/api/payment/failure",
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

//
// ✅ STEP 2: SUCCESS CALLBACK
//
router.all('/success', async (req, res) => {
    console.log("PayU SUCCESS:", req.body, req.query);

    const data = req.method === 'POST' ? req.body : req.query;

    const { status, txnid, amount } = data;

    const normalizedStatus = status?.toLowerCase() || 'success';
    const safeAmount = amount || 99;

    try {
        const [payments] = await db.query(
            `SELECT user_id FROM payments WHERE txn_id = ?`,
            [txnid]
        );

        if (!payments.length) {
            console.log("❌ Payment not found:", txnid);
            return res.redirect(`http://localhost:4200/payment-failure`);
        }

        const userId = payments[0].user_id;

        const [users] = await db.query(
            `SELECT plan_expires FROM users WHERE id = ?`,
            [userId]
        );

        const user = users[0];

        await db.query(
            `UPDATE payments 
             SET status = ?, amount = ?, raw_response = ?
             WHERE txn_id = ?`,
            [
                normalizedStatus,
                safeAmount,
                JSON.stringify(data),
                txnid
            ]
        );

        if (normalizedStatus === 'success') {
            let baseDate = new Date();

            if (user.plan_expires && new Date(user.plan_expires) > new Date()) {
                baseDate = new Date(user.plan_expires);
            }

            baseDate.setDate(baseDate.getDate() + 30);

            await db.query(
                `UPDATE users 
                 SET plan_type = 'premium', plan_expires = ?
                 WHERE id = ?`,
                [baseDate, userId]
            );
        }

    } catch (err) {
        console.error("❌ SUCCESS DB ERROR:", err);
    }

    res.redirect(`http://localhost:4200/payment-success?status=${status}&txnid=${txnid}&amount=${amount}`);
});
//
// ❌ STEP 3: FAILURE CALLBACK
//
router.all("/failure", async (req, res) => {
    console.log("PayU FAILURE:", req.body);

    const { status, txnid, amount } = req.body;

    const normalizedStatus = status?.toLowerCase() || 'failure';
    const safeAmount = amount || 99;

    try {
        // 🔄 UPDATE EXISTING PAYMENT
        await db.query(
            `UPDATE payments 
             SET status = ?, amount = ?, raw_response = ?
             WHERE txn_id = ?`,
            [
                normalizedStatus,
                safeAmount,
                JSON.stringify(req.body),
                txnid
            ]
        );

        console.log("Failure updated:", txnid);

    } catch (err) {
        console.error("❌ FAILURE DB ERROR:", err);
    }

    res.redirect(`http://localhost:4200/payment-failure?txnid=${txnid}&status=${normalizedStatus}`);
});

//
// 📊 STEP 4: PAYMENT HISTORY
//
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT txn_id, amount, status, created_at 
             FROM payments 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;