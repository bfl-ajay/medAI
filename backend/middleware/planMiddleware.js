const db = require('../db');

module.exports = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.execute(
            "SELECT plan_type, trial_start FROM users WHERE id=?",
            [userId]
        );

        const user = rows[0];

        if (user.plan_type === 'premium') {
            return next();
        }

        const trialStart = user.trial_start
            ? new Date(user.trial_start)
            : new Date(); // fallback

        const today = new Date();

        const diffDays = Math.floor(
            (today - trialStart) / (1000 * 60 * 60 * 24)
        );

        if (diffDays < 7) {
            return next(); // trial active
        }

        return res.status(403).json({
            message: "Trial expired. Please upgrade to premium."
        });

    } catch (err) {
        console.error("PLAN MIDDLEWARE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};