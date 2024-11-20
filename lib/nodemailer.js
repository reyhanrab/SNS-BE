import { createTransport } from "nodemailer";

const createdTransporter = () => {
  const transporter = createTransport({
    host: "smtp.gmail.com",
    secure: true,
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
    to: to,
    subject: "Password Reset Code - Scope N' Stack",
    text: `Your verification code is: ${verificationCode}`,
  });
};

const newCampaignEmail = async (user) => {
  const transporter = createdTransporter();

  return await transporter.sendMail({
    to: user.email,
    subject: "New Campaign Created",
    text: `Hello ${user.username},\n\nA new campaign has been created. Please check your dashboard for more details.\n\nBest regards,\nYour Team`,
  });
};

const sendRegistrationEmail = async (to, registrationId) => {
  const transporter = createdTransporter();

  return await transporter.sendMail({
    to,
    subject: "Volunteer Registration Confirmation",
    html: `
      <h1>Registration Successful!</h1>
      <p>Thank you for registering. Your unique registration ID is:</p>
      <p><strong>${registrationId}</strong></p>
      <p>We look forward to seeing you!</p>
    `,
  });
};

const sendPaymentConfirmation = async (to, campaignName, amountDonated) => {
  const transporter = createdTransporter();

  return await transporter.sendMail({
    to,
    subject: "Campaign Donation Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #4CAF50;">Donation Successful!</h1>
        <p>Dear Donor,</p>
        <p>Thank you for your generous contribution to the campaign: <strong>${campaignName}</strong>.</p>
        <p>Your donation of <strong>$${amountDonated}</strong> has been successfully received.</p>
        <p>We are immensely grateful for your support. Together, we can make a difference!</p>
        <p>Warm regards,</p>
        <p>The Campaign Team</p>
      </div>
    `,
  });
};

export default {
  createdTransporter,
  signupEmail,
  sendPasswordResetCode,
  newCampaignEmail,
  sendRegistrationEmail,
  sendPaymentConfirmation
};
