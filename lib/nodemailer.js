import { createTransport } from "nodemailer";

const createdTransporter = () => {
  const transporter = createTransport({
    host: "smtp.gmail.com",
    secure: true,
    //secureConnection: false, // TLS requires secureConnection to be false
    //tls: {
    // ciphers: "SSLv3",
    //},
    //requireTLS: true,
    port: 465,
    debug: true,
    auth: {
      user: process.env.SMTP_USER, // Load from environment variables
      pass: process.env.SMTP_PASS, // Load from environment variables
    },
    connectionTimeout: 60000, // Increase connection timeout
    greetingTimeout: 30000, // Increase greeting timeout
    socketTimeout: 60000, // Increase socket timeout
  });
  return transporter;
};

const signupEmail = (userName) => {
  return `
      <h1>Hello, ${userName}!!!</h1>
      <p>Thank you for registering on our platform. We're excited to have you on board.</p>
      <p>Please feel free to explore our services and don't hesitate to reach out if you need help.</p>
      <br>
      <p>Best regards,</p>
      <p>Scope N' Stack Team</p>
    `;
};

const sendPasswordResetCode = async (to, verificationCode) => {
  const transporter = createdTransporter();

  return await transporter.sendMail({
    to: "mdreyhan007@gmail.com",
    subject: "Password Reset Code - Scope N' Stack",
    text: `Your verification code is: ${verificationCode}`,
  });
};

export default {
  createdTransporter,
  signupEmail, sendPasswordResetCode
};
