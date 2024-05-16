import { VercelRequest, VercelResponse } from '@vercel/node';

const Mailgun = require('mailgun-js');

// Define your Mailgun API key, domain, and sender email
const MAILGUN_API_KEY = '08c0f90675f9b1842222e87530dffc82-32a0fef1-f31dc1b2';
const MAILGUN_DOMAIN = 'sandboxca1c4a23eddf449dbd644216204e4fd2.mailgun.org';
const SENDER_EMAIL = 'postmaster@sandboxca1c4a23eddf449dbd644216204e4fd2.mailgun.org';

// Function to send an email
async function sendEmail(recipient: string, subject: string, text: string): Promise<void> {
  // Initialize Mailgun
  const mailgun = Mailgun({
    apiKey: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN
  });

  const data = {
    from: SENDER_EMAIL,
    to: recipient,
    subject: subject,
    text: text
  };

  try {
    await mailgun.messages().send(data);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { name = 'World' } = req.query
  await sendEmail('r_v218@yahoo.com', 'test email', 'This is a test');
  return res.json({
    message: `Hello ${name}!`,
  })
}