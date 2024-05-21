import puppeteer, { Browser, Page } from 'puppeteer';

export interface Product {
  name: string;
  quantity: number;
  price: number;
}

export interface QuoteMetaData {
  products: Product[];
  email: string;
  name: string;
}

export default async function generateQuotePDF(metadata: QuoteMetaData) {
  let { email, products, name } = metadata;
  let browser: Browser | null = null;
  let outputPath = name.trim().replace(/ /g, '_') + Date.now() + '.png';

  try {
    // Launch a headless browser
    browser = await puppeteer.launch();
    const page: Page = await browser.newPage();
    // Create the HTML content
    const htmlContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Product Quote</h1>
        <p><strong>Name: </strong> ${name}</p>
        <p><strong>email: </strong> ${email}</p>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>${(product.quantity * product.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total">Grand Total</td>
              <td class="total">
                ${products.reduce((sum, product) => sum + (product.quantity * product.price), 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    // Set the content of the page
    await page.setContent(htmlContent);
    await page.screenshot({ path: `./quotes/${outputPath}`, fullPage: true });

    console.log('PDF generated successfully');
    return outputPath;
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    if (browser) {
      // Close the browser
      await browser.close();
    }
  }
};
