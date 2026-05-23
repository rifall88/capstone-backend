import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendOtpEmail = async (targetEmail, otpCode) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: targetEmail,
    subject: "Kode OTP Verifikasi Akun Kamu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Verifikasi Akun Smart Digital Twin</h2>
        <p>Halo, terima kasih telah mendaftar. Gunakan kode OTP di bawah ini untuk memverifikasi akun kamu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777; font-size: 12px; text-align: center;">Kode ini hanya berlaku selama 5 menit. Jangan sebarkan kode ini kepada siapapun.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
