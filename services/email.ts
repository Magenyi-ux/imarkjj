import emailjs from '@emailjs/browser';
import { emailConfig } from './emailConfig';

/**
 * ENTERPRISE EMAIL SERVICE
 * Handles communication for verification codes and admin alerts using EmailJS.
 */
export class EmailService {
  private static ADMIN_EMAIL = "magenyigoodluck12@gmail.com";

  /**
   * Generates a 5-character alphanumeric and symbolic code.
   */
  static generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Sends an email using EmailJS.
   * This requires a generic template in EmailJS set up to accept variables
   * like {{to_email}}, {{subject}}, and {{body}}.
   */
  static async sendEmail(to: string, subject: string, body: string, from: string = "EduVantage"): Promise<boolean> {
    if (!emailConfig.serviceId || emailConfig.serviceId === 'YOUR_SERVICE_ID') {
      console.error("EmailJS serviceId is not configured. Please update services/emailConfig.ts");
      // Fallback to alert for local testing if not configured
      if (to !== this.ADMIN_EMAIL) {
        alert(`[EduVantage] Verification Code Sent to ${to}:\n\n${body}`);
      }
      return false;
    }

    const templateParams = {
      to_email: to,
      from_name: from,
      subject: subject,
      message: body,
    };

    try {
      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        templateParams,
        emailConfig.publicKey
      );
      console.log(`%c[EMAIL SYSTEM] Email sent successfully to: ${to}`, "color: #16a34a; font-weight: bold;");
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  static async sendVerificationCode(userEmail: string, code: string, userName: string) {
    await this.sendEmail(
      userEmail,
      "Your EduVantage Access Code",
      `Hello ${userName},\n\nYour 5-character access code is: ${code}\n\nPlease enter this in the app to proceed.`,
      "EduVantage Security"
    );

    await this.sendEmail(
      this.ADMIN_EMAIL,
      "New User Access Attempt",
      `User ${userName} (${userEmail}) is attempting to use the app. Access code generated: ${code}`,
      "EduVantage Admin"
    );
  }

  static async notifyAdminLogout(userEmail: string, userName: string) {
     await this.sendEmail(
        this.ADMIN_EMAIL,
        "User Session Terminated",
        `User ${userName} (${userEmail}) has logged out or left the application.`,
        "EduVantage System"
    );
  }

  static async sendComplaint(userEmail: string, userName: string, message: string) {
    await this.sendEmail(
      this.ADMIN_EMAIL,
      "New Candidate Complaint/Request",
      `From: ${userName} (${userEmail})\n\nMessage: ${message}`,
      "EduVantage Feedback"
    );
  }
}
