import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
});

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${env.frontendUrl}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: env.email.from,
    to,
    subject: 'Verify your Research Platform email',
    html: `
      <h2>Welcome to Research Platform!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${url}" style="background:#2563EB;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">
        Verify Email
      </a>
      <p>Or copy this link: ${url}</p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${env.frontendUrl}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: env.email.from,
    to,
    subject: 'Reset your Research Platform password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${url}" style="background:#2563EB;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">
        Reset Password
      </a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

export async function sendApplicationStatusEmail(
  to: string,
  studentName: string,
  professorName: string,
  projectTitle: string,
  status: string,
): Promise<void> {
  const statusMessages: Record<string, string> = {
    UNDER_REVIEW: 'Your application is now under review.',
    ACCEPTED: 'Congratulations! Your application has been accepted.',
    REJECTED: 'Unfortunately, your application was not selected at this time.',
    INTERVIEW_REQUESTED: 'The professor would like to schedule an interview with you.',
  };

  await transporter.sendMail({
    from: env.email.from,
    to,
    subject: `Application Update: ${projectTitle}`,
    html: `
      <h2>Application Status Update</h2>
      <p>Hi ${studentName},</p>
      <p>${statusMessages[status] || 'Your application status has been updated.'}</p>
      <p><strong>Professor:</strong> ${professorName}</p>
      <p><strong>Project:</strong> ${projectTitle}</p>
      <p>
        <a href="${env.frontendUrl}/student/applications"
           style="background:#2563EB;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">
          View Application
        </a>
      </p>
    `,
  });
}

export async function sendNewApplicationEmail(
  to: string,
  professorName: string,
  studentName: string,
  projectTitle: string,
): Promise<void> {
  await transporter.sendMail({
    from: env.email.from,
    to,
    subject: `New application for: ${projectTitle}`,
    html: `
      <h2>New Application Received</h2>
      <p>Hi ${professorName},</p>
      <p>${studentName} has applied to your project: <strong>${projectTitle}</strong></p>
      <p>
        <a href="${env.frontendUrl}/professor/applications"
           style="background:#2563EB;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">
          Review Application
        </a>
      </p>
    `,
  });
}
