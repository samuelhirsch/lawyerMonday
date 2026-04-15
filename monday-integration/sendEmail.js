import nodemailer from "nodemailer";
import fs from "fs";
export default async function sendEmail(toEmail, pdfPath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Under Contract Information",
    text: "Attached is your under contract PDF.",
    attachments: [
      {
        filename: "contract.pdf",
        path: `./${pdfPath}`,
      },
    ],
  });

}