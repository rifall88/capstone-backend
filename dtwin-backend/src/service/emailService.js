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

export const sendChangeEmailOtpEmail = async (targetEmail, otpCode) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: targetEmail,
    subject: "Kode OTP Perubahan Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Perubahan Alamat Email</h2>
        <p>Halo, kami menerima permintaan untuk mengubah alamat email akun Smart Digital Twin kamu. Gunakan kode OTP di bawah ini untuk memverifikasi email baru kamu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777; font-size: 12px; text-align: center;">Kode OTP ini hanya berlaku selama 5 menit. Jika kamu tidak meminta perubahan email ini, abaikan pesan ini.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendForgotPasswordOtpEmail = async (targetEmail, otpCode) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: targetEmail,
    subject: "Kode OTP Reset Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Reset Password Akun</h2>
        <p>Halo, kami menerima permintaan untuk mengatur ulang (*reset*) password akun Smart Digital Twin kamu. Gunakan kode OTP di bawah ini untuk melanjutkan:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2196F3; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777; font-size: 12px; text-align: center;">Kode OTP ini hanya berlaku selama 5 menit. Jika kamu tidak merasa meminta reset password, abaikan email ini dan pastikan akunmu aman.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendDeleteAccountOtpEmail = async (targetEmail, otpCode) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: targetEmail,
    subject: "Konfirmasi Penghapusan Akun",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Konfirmasi Penghapusan Akun</h2>
        <p>Kami menerima permintaan untuk menghapus akun Smart Digital Twin milik kamu. Gunakan kode OTP di bawah ini untuk melanjutkan proses penghapusan akun:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d9534f; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777; font-size: 12px; text-align: center;">Kode OTP ini hanya berlaku selama 5 menit. Jika kamu tidak merasa meminta penghapusan akun, abaikan email ini.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendAdminDeletionEmail = async (userEmail, username) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER,
    subject: "Permintaan Penghapusan Akun Baru",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #d9534f; text-align: center;">Notifikasi Penghapusan Akun</h2>
        <p>Halo Admin,</p>
        <p>Sistem menerima permintaan penghapusan akun baru dengan detail sebagai berikut:</p>
        <ul>
          <li><strong>Email User:</strong> ${userEmail}</li>
          <li><strong>Username:</strong> ${username}</li>
        </ul>
        <p>Silakan log in ke Dashboard Admin untuk meninjau dan mengeksekusi permintaan penonaktifan akun ini.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendUserDeletionPendingEmail = async (targetEmail) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: targetEmail,
    subject: "Permintaan Penghapusan Akun Sedang Diproses",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Permintaan Penghapusan Akun</h2>
        <p>Halo,</p>
        <p>Permintaan penghapusan akun Anda telah berhasil diajukan dan saat ini masuk ke dalam antrean sistem.</p>
        
        <div style="background: #fcf8e3; border-left: 5px solid #f0ad4e; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #8a6d3b; font-weight: bold;">Informasi Proses Kerja Admin:</p>
          <p style="margin: 5px 0 0 0; color: #666; line-height: 1.5;">
            Proses penghapusan atau penonaktifan akun akan dilakukan secara manual oleh Admin pada jam kerja operasional:
            <br><strong>Senin - Jumat, pukul 08.00 - 15.00 WIB</strong>.
            <br>Hari Sabtu, Minggu, dan hari libur nasional operasional tutup.
          </p>
        </div>
        
        <p style="color: #777; font-size: 12px; text-align: center;">Jika Anda tidak merasa melakukan permintaan ini, segera hubungi layanan dukungan kami.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
