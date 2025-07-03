const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");

// Configure email transporter
// Note: In production, you should use environment variables for these credentials
const transporter = nodemailer.createTransport({
  service: "gmail", // or another email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send invoice email
router.post("/send-invoice", auth, async (req, res) => {
  try {
    const { recipient, subject, invoiceId, invoiceData } = req.body;

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: subject || `Invoice #${invoiceId}`,
      html: `
        <h1>Invoice #${invoiceId}</h1>
        <p>Please find your invoice attached.</p>
        <p>Total amount due: $${invoiceData.total}</p>
        <p>Due date: ${invoiceData.dueDate}</p>
      `,
      // You can add attachments here if needed
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: "Invoice email sent successfully" });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    res.status(500).json({ error: "Failed to send invoice email" });
  }
});

// Send payment reminder
router.post("/payment-reminder", auth, async (req, res) => {
  try {
    const { recipient, invoiceId, daysOverdue, amountDue } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: `Payment Reminder: Invoice #${invoiceId}`,
      html: `
        <h1>Payment Reminder</h1>
        <p>Your payment for Invoice #${invoiceId} is ${daysOverdue} days overdue.</p>
        <p>Amount due: $${amountDue}</p>
        <p>Please make your payment as soon as possible.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: "Reminder email sent successfully" });
  } catch (error) {
    console.error("Error sending reminder email:", error);
    res.status(500).json({ error: "Failed to send reminder email" });
  }
});

// Send receipt
router.post("/send-receipt", auth, async (req, res) => {
  try {
    const { recipient, paymentDetails, invoiceId } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: `Receipt for Invoice #${invoiceId}`,
      html: `
        <h1>Payment Receipt</h1>
        <p>Thank you for your payment for Invoice #${invoiceId}.</p>
        <p>Amount paid: $${paymentDetails.amount}</p>
        <p>Payment date: ${paymentDetails.date}</p>
        <p>Payment method: ${paymentDetails.method}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: "Receipt email sent successfully" });
  } catch (error) {
    console.error("Error sending receipt email:", error);
    res.status(500).json({ error: "Failed to send receipt email" });
  }
});

module.exports = router;