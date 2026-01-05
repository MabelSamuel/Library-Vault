import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// export const sendEmail = async (to: string, subject: string, html: string) => {
//   const info = await transporter.sendMail({
//     from: `"LibraryVault" <${process.env.SMTP_FROM}>`,
//     to,
//     subject,
//     html,
//   });
//   console.log("Email sent: %s", info.messageId);
// };

export async function sendTestEmail(to: string, subject: string, html: string) {
  // Generate a test account
  const testAccount = await nodemailer.createTestAccount();

  console.log("Test account created:");
  console.log("  User: %s", testAccount.user);
  console.log("  Pass: %s", testAccount.pass);

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: `"Test App" <${testAccount.user}>`,
    to,
    subject,
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview: %s", nodemailer.getTestMessageUrl(info));
}