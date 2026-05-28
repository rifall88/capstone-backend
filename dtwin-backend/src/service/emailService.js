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
    subject: "Your Account Verification OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Smart Digital Twin Account Verification</h2>
        <p>Hello, thank you for registering. Use the OTP code below to verify your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777; font-size: 12px; text-align: center;">This code is only valid for 5 minutes. Do not share this code with anyone.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendChangeEmailOtpEmail = async (targetEmail, otpCode) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: targetEmail,
    subject: "Email Change OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Email Address Change</h2>
        <p>Hello, we received a request to change the email address of your Smart Digital Twin account. Use the OTP code below to verify your new email:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777; font-size: 12px; text-align: center;">This OTP code is only valid for 5 minutes. If you did not request this email change, please ignore this message.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendForgotPasswordOtpEmail = async (targetEmail, otpCode) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: targetEmail,
    subject: "Password Reset OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Account Password Reset</h2>
        <p>Hello, we received a request to reset the password for your Smart Digital Twin account. Use the OTP code below to continue:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2196F3; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777; font-size: 12px; text-align: center;">This OTP code is only valid for 5 minutes. If you did not request a password reset, please ignore this email and ensure your account is secure.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendDeleteAccountOtpEmail = async (targetEmail, otpCode) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: targetEmail,
    subject: "Account Deletion Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Account Deletion Confirmation</h2>
        <p>We received a request to delete your Smart Digital Twin account. Use the OTP code below to continue the account deletion process:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d9534f; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777; font-size: 12px; text-align: center;">This OTP code is only valid for 5 minutes. If you did not request account deletion, please ignore this email.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendAdminDeletionEmail = async (userEmail, username) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER,
    subject: "New Account Deletion Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #d9534f; text-align: center;">Account Deletion Notification</h2>
        <p>Hello Admin,</p>
        <p>The system has received a new account deletion request with the following details:</p>
        <ul>
          <li><strong>User Email:</strong> ${userEmail}</li>
          <li><strong>Username:</strong> ${username}</li>
        </ul>
        <p>Please log in to the Admin Dashboard to review and execute this account deactivation request.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendUserDeletionPendingEmail = async (targetEmail) => {
  const mailOptions = {
    from: `"Smart Digital Twin" <${process.env.MAIL_USER}>`,
    to: targetEmail,
    subject: "Account Deletion Request is Being Processed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Account Deletion Request</h2>
        <p>Hello,</p>
        <p>Your account deletion request has been successfully submitted and is currently in the system queue.</p>
        
        <div style="background: #fcf8e3; border-left: 5px solid #f0ad4e; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #8a6d3b; font-weight: bold;">Admin Working Process Information:</p>
          <p style="margin: 5px 0 0 0; color: #666; line-height: 1.5;">
            The account deletion or deactivation process will be done manually by the Admin during operational working hours:
            <br><strong>Monday - Friday, 08:00 - 15:00 WIB</strong>.
            <br>Saturdays, Sundays, and national holidays operations are closed.
          </p>
        </div>
        
        <p style="color: #777; font-size: 12px; text-align: center;">If you did not make this request, please contact our support service immediately.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
