const db = require('../db');

module.exports = async (req, res, next) => {
    try {
        // ✅ Check auth first
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.id;

        const [rows] = await db.execute(
            "SELECT plan_type, trial_start FROM users WHERE id=?",
            [userId]
        );

        // ✅ Check user exists
        if (!rows.length) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = rows[0];

        // ✅ Premium users always allowed
        if (user.plan_type === 'premium') {
            return next();
        }

        // ❌ If no trial_start → block instead of giving free trial
        if (!user.trial_start) {
            return res.status(403).json({
                message: "Trial not started. Please activate or upgrade."
            });
        }

        const trialStart = new Date(user.trial_start);
        const today = new Date();

        const diffDays = Math.floor(
            (today - trialStart) / (1000 * 60 * 60 * 24)
        );

        // ✅ Trial valid
        if (diffDays < 7) {
            return next();
        }

        // ❌ Trial expired
        return res.status(403).json({
            message: "Trial expired. Please upgrade to premium."
        });

    } catch (err) {
        console.error("PLAN MIDDLEWARE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};