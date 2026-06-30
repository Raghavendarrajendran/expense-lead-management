import { Injectable } from '@nestjs/common';

export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  moduleName: string;
  referenceId?: string;
  sentAt: string;
}

@Injectable()
export class EmailService {
  private sentEmails: SentEmailLog[] = [];

  getSentEmails(): SentEmailLog[] {
    return this.sentEmails;
  }

  sendEmail(
    to: string,
    subject: string,
    message: string,
    moduleName: string,
    refId?: string,
    actionLink?: string,
    userName = 'User',
  ) {
    const formattedBody = `
Subject: ZSmart - ${subject}

Hello ${userName},

${message}

Module: ${moduleName}
Reference: ${refId || 'N/A'}
Action: ${actionLink || 'N/A'}

Regards,
ZSmart Team
`;

    const emailLog: SentEmailLog = {
      id: `email_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      to,
      subject: `ZSmart - ${subject}`,
      body: formattedBody,
      moduleName,
      referenceId: refId,
      sentAt: new Date().toISOString(),
    };

    this.sentEmails.push(emailLog);

    console.log('\n=================== MOCK EMAIL SENT ===================');
    console.log(formattedBody);
    console.log('=======================================================\n');

    return emailLog;
  }

  sendLeadAssignedEmail(userName: string, to: string, customerName: string, leadId: string) {
    this.sendEmail(
      to,
      'New Lead Assigned',
      `You have been assigned a new lead: ${customerName}`,
      'Lead Management',
      leadId,
      `/leads/${leadId}`,
      userName,
    );
  }

  sendFollowUpReminderEmail(
    userName: string,
    to: string,
    customerName: string,
    time: string,
    isOverdue = false,
  ) {
    const msg = isOverdue
      ? `Follow-up with ${customerName} is overdue. Please update the status.`
      : `You have a follow-up with ${customerName} scheduled for ${time}.`;
    this.sendEmail(
      to,
      isOverdue ? 'Follow-up Overdue' : 'Follow-up Reminder',
      msg,
      'Lead Management',
      undefined,
      '/leads',
      userName,
    );
  }

  sendExpenseSubmittedEmail(userName: string, to: string, amount: number, expenseId: string) {
    this.sendEmail(
      to,
      'Expense Claim Submitted',
      `An expense claim of ₹${amount} has been successfully submitted for your approval.`,
      'Expense Management',
      expenseId,
      `/approvals/${expenseId}`,
      userName,
    );
  }

  sendExpenseApprovedEmail(userName: string, to: string, amount: number, approver: string, expenseId: string) {
    this.sendEmail(
      to,
      'Expense Claim Approved',
      `Your expense claim of ₹${amount} has been approved by ${approver}.`,
      'Expense Management',
      expenseId,
      `/expenses/${expenseId}`,
      userName,
    );
  }

  sendExpenseRejectedEmail(
    userName: string,
    to: string,
    amount: number,
    rejecter: string,
    reason: string,
    expenseId: string,
  ) {
    this.sendEmail(
      to,
      'Expense Claim Rejected',
      `Your expense claim of ₹${amount} has been rejected by ${rejecter}. Reason: ${reason}`,
      'Expense Management',
      expenseId,
      `/expenses/${expenseId}`,
      userName,
    );
  }

  sendFinanceVerifiedEmail(userName: string, to: string, amount: number, expenseId: string) {
    this.sendEmail(
      to,
      'Expense Verified by Finance',
      `Your expense claim of ₹${amount} has been verified and processed by finance.`,
      'Finance Verification',
      expenseId,
      `/expenses/${expenseId}`,
      userName,
    );
  }

  sendPaymentCompletedEmail(userName: string, to: string, amount: number, expenseId: string) {
    this.sendEmail(
      to,
      'Expense Reimbursed (Paid)',
      `Reimbursement of ₹${amount} has been disbursed and marked as PAID.`,
      'Finance Verification',
      expenseId,
      `/expenses/${expenseId}`,
      userName,
    );
  }

  sendAdminAnnouncementEmail(userName: string, to: string, title: string, content: string) {
    this.sendEmail(
      to,
      title,
      content,
      'Admin Announcements',
      undefined,
      '/dashboard',
      userName,
    );
  }
}
