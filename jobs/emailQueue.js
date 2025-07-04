const Queue = require('bull');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
require('dotenv').config();

// Initialize Bull queue
const emailQueue = new Queue('emailQueue', {
  redis: { host: '127.0.0.1', port: 6379 }
});

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

// Process "verifyEmail" job
emailQueue.process('verifyEmail', async (job) => {
  const { email, token, name } = job.data;
  const link = `${process.env.BASE_URL}/api/users/verify/${token}`;

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Verify Team <${process.env.EMAIL_FROM}>`,
      to: [email],
      subject: 'Verify Your Account',
      html: `
        <p>Hello ${name},</p>
        <p>Please verify your account by clicking the link below:</p>
        <p><a href="${link}">Click here</a></p>
        <p>If the above link doesn’t work, copy and paste it into your browser.</p>
        `
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Error sending verification email to ${email}:`, err);
    throw err; // Let Bull retry
  }
});

// Retry failed jobs up to 5 times, then fallback
emailQueue.on('failed', async (job, err) => {
  if (job.attemptsMade >= 5) {
    console.log('⚠️ Job failed permanently. Sending fallback email.');

    try {
      await mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: `Support Team <${process.env.EMAIL_FROM}>`,
        to: [job.data.email],
        subject: 'Verification Email Failed',
        text: 'We could not send your verification email. Please contact support or try again later.'
      });

      console.log(`📩 Fallback email sent to ${job.data.email}`);
    } catch (fallbackErr) {
      console.error(`❌ Failed to send fallback email:`, fallbackErr);
    }
  }
});

module.exports = {emailQueue,mg};               