const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendRecoveryEmailAdded = async (toEmail) => {
    try {
        const response = await resend.emails.send({
            from: 'MedAI <onboarding@resend.dev>',
            to: toEmail,
            subject: 'Recovery Email Added',
            html: `<h2>Recovery Email Added</h2>`
        });

        console.log("RESEND RESPONSE:", response); // 👈 ADD THIS

    } catch (err) {
        console.error("Email error:", err);
    }
};

module.exports = { sendRecoveryEmailAdded };