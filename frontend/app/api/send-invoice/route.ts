import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, pdfBase64 } = await request.json();
    
    // Create a test account if you don't have an SMTP server
    // let testAccount = await nodemailer.createTestAccount();
    
    // Configure transport (use your SMTP credentials in production)
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.example.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Boolean(process.env.EMAIL_SECURE) || false,
      auth: {
        user: process.env.EMAIL_USER || "user@example.com",
        pass: process.env.EMAIL_PASS || "password",
      },
    });
    
    // Extract PDF from base64 string
    const pdfBuffer = Buffer.from(
      pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
      "base64"
    );
    
    // Send email
    let info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Swift Bill" <invoice@swiftbill.com>',
      to,
      subject,
      text: message,
      html: message.replace(/\n/g, "<br/>"),
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
    
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Email sending failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}