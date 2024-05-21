import { OpenAI } from 'openai';
import { Product } from './generatePDFQuote';

// Maximum tokens allowed by text-davinci-003 model
const formattedData = `{
  "products": [{"name": string, "quantity": number, "unit": string}]
}`

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

function calculatePrice(products: { name: string, quantity: number} []): Product[] {
  return products.map(({ name, quantity }) => {
    return {
      name,
      quantity,
      price: quantity * Math.random()*900 + 100
    }
  });
}

export default async function getQuantities(message: string) {
  const query = `
  From the following message validate if its requesting a quote.
  If it is valid then extract the products along with quantities requested.
  Return the extracted data in form of valid JSON string formatted as ${formattedData}.
  If it is invalid then return 'Invalid Data'. 
  Message: ${message}`;

  try {
    // Call the OpenAI completion API
    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: query,
      max_tokens: 1000,
      n: 1,
      stop: null,
      temperature: 0.1,
      stream: false,
    });

    // Extract the completion text from the response
    const answer = JSON.parse(completion.choices[0].text.trim());
    return calculatePrice(answer.products);
  } catch (error) {
    // Handle errors
    console.error('Error querying OpenAI:', error);
    throw new Error(`Error querying OpenAI: ${error}`);
  }
}
