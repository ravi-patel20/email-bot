import path from 'path';
import * as fs from 'fs';

const Mailgun = require('mailgun-js');

// Function to send an email
export default async function sendEmail(recipient: string, subject: string, text: string, filename: string): Promise<void> {
  // Initialize Mailgun
  const mailgun = Mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  });
  const filepath = path.join('quotes', filename);
  const file = fs.readFileSync(filepath);

  const attach = new mailgun.Attachment({data: file, filename: filename});

  const data = {
    from: process.env.SENDER_EMAIL,
    to: recipient,
    subject: subject,
    html: text,
    attachment: attach
  };

  try {
    await mailgun.messages().send(data);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}