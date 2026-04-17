import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // Outlook SMTP
    port: 587,
    secure: false, 
    auth: {
      user: process.env.OUTLOOK_EMAIL,
      pass: process.env.OUTLOOK_PASSWORD,
    },
  });

  async sendOutlookNotification(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: '"STI RACA System" <your-email@sti.edu>',
        to,
        subject,
        text,
      });
    } catch (error) {
      console.error('Email failed to send:', error);
    }
  }
}