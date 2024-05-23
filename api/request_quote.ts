import { VercelRequest, VercelResponse } from '@vercel/node';
import getQuantities from '../utils/getQuantities';
import generateQuotePDF from '../utils/generatePDFQuote';
import sendEmail from '../utils/sendEmail';

interface RequestQuotePayload {
  name: string;
  email: string;
  message: string;
  subject: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const {email, message, name } = <RequestQuotePayload>JSON.parse(req.body);
  const products = await getQuantities(message);

  const generatedPDFUrl = await generateQuotePDF({ email, name, products}).catch(console.error);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (!generatedPDFUrl || !generatedPDFUrl?.length) {
    res.status(400);
    return res.send('Failure generating a quote');
  }

  const subject = 'Your requested quote is ready';
  const messageResponse = `<p>Hello ${name},</p> <p>Please review your requested quote and let us know of any concerns.</p> <p>CloudForge Team</p>`

  await sendEmail(email, subject, messageResponse, generatedPDFUrl);

  res.status(200);
  return res.send('Request Submitted Successfully');
}