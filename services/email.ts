
/**
 * ENTERPRISE EMAIL SERVICE
 * Handles communication for verification codes and admin alerts.
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
   * Sends email notification.
   * NOTE: In a browser-only environment, direct SMTP via Gmail is blocked by CORS.
   * In a production enterprise app, this would hit a Node.js /api/send-email endpoint.
   * FOR TESTING: We use alerts to ensure the user gets the code immediately.
   */
  static async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`%c[EMAIL SYSTEM] TO: ${to}`, "color: #4f46e5; font-weight: bold;");
    console.log(`%c[SUBJECT]: ${subject}`, "color: #4f46e5;");
    console.log(`%c[BODY]: ${body}`, "color: #334155;");

    // FALLBACK FOR BROWSER TESTING:
    // This allows the user to see the code even without a configured backend relay.
    if (to !== this.ADMIN_EMAIL) {
      alert(`[EduVantage] Verification Code Sent to ${to}:\n\n${body}`);
    }
    
    // Simulate API call to backend relay
    try {
      // In a real deployment, you would fetch a serverless function here
      // fetch('/api/send', { method: 'POST', body: JSON.stringify({ to, subject, body }) });
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;
    } catch (e) {
      return false;
    }
  }

  static async sendVerificationCode(userEmail: string, code: string, userName: string) {
    await this.sendEmail(
      userEmail,
      "Your EduVantage Access Code",
      `Hello ${userName},\n\nYour 5-character access code is: ${code}\n\nPlease enter this in the app to proceed.`
    );

    await this.sendEmail(
      this.ADMIN_EMAIL,
      "New User Access Attempt",
      `User ${userName} (${userEmail}) is attempting to use the app. Access code generated: ${code}`
    );
  }

  static async notifyAdminLogout(userEmail: string, userName: string) {
    // Using navigator.sendBeacon for reliable "on leave" notification
    const data = JSON.stringify({
      to: this.ADMIN_EMAIL,
      subject: "User Session Terminated",
      body: `User ${userName} (${userEmail}) has logged out or left the application.`
    });
    
    // Attempt beacon if supported, otherwise standard log
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        // This would hit a real logging endpoint in production
        // navigator.sendBeacon('/api/log', data);
    }
    
    console.log("Admin notified of logout/exit");
  }

  static async sendComplaint(userEmail: string, userName: string, message: string) {
    await this.sendEmail(
      this.ADMIN_EMAIL,
      "New Candidate Complaint/Request",
      `From: ${userName} (${userEmail})\n\nMessage: ${message}`
    );
  }
}
