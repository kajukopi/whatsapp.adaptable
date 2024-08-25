const nodemailer = require('nodemailer');
const Router = require('koa-router')
const router = new Router()
const User = require("../models/user")



// HOME
router.get('/', async (ctx) => {
  await ctx.render('home', { title: 'Home', })
})

// HOME
router.get('/scan', async (ctx) => {
  await ctx.render('scan', { title: 'Scan', })
})
// HOME

// SEND PASSWORD RESET EMAIL
async function sendPasswordResetEmail(user) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS  // Your Gmail password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Setup email data
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: user.email, // List of receivers
    subject: 'Password Reset Request', // Subject line
    text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           ${process.env.HOST}/reset-password/${user.passwordResetToken}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n` // Plain text body
  };

  // Send mail with defined transport object
  await transporter.sendMail(mailOptions);
  console.log('Send mail with defined transport object');
}



module.exports = router
