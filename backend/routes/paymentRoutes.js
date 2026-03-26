const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const MERCHANT_KEY = process.env.PAYU_KEY;
const SALT = process.env.PAYU_SALT;

//  STEP 1: Generate PayU request
router.post("/pay", async (req, res) => {
    try {
        const { amount, name, email } = req.body;

        const txnid = "txn_" + Date.now();
        const productinfo = "Health Report";

        // REQUIRED empty fields
        const udf1 = "";
        const udf2 = "";
        const udf3 = "";
        const udf4 = "";
        const udf5 = "";

        const hashString =
            `${MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${name}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${SALT}`;

        console.log("Hash String:", hashString); // DEBUG

        const hash = crypto
            .createHash("sha512")
            .update(hashString)
            .digest("hex");

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
        console.log("Hash String:", hashString);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  STEP 2: Verify payment (basic)
router.post("/verify", (req, res) => {
    const { status, txnid } = req.body;

    if (status === "success") {
        console.log("Payment success:", txnid);
        return res.json({ success: true });
    }

    res.json({ success: false });
});

router.post("/success", async (req, res) => {

    const { status, email } = req.body;

    if (status === "success") {

        await db.execute(
            "UPDATE users SET plan_type='premium' WHERE email=?",
            [email]
        );
    }

    res.redirect("http://localhost:4200/payment-success");
});

router.post("/failure", (req, res) => {
    console.log("PayU Failure Response:", req.body);

    const { status, txnid } = req.body;

    res.redirect(`http://localhost:4200/payment-failure?txnid=${txnid}&status=${status}`);
});

module.exports = router;