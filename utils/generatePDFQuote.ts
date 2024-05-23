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
  let browser = null;
  let outputPath = name.trim().replace(/ /g, '_') + Date.now() + '.png';
  let chrome;
  let puppeteer;
  let launchArgs;
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    // running on the Vercel platform.
    chrome = require('chrome-aws-lambda');
    puppeteer = require('puppeteer-core');
    launchArgs = {
      args: [...chrome?.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chrome?.defaultViewport,
      executablePath: await chrome?.executablePath,
      headless: chrome?.headless,
      ignoreHTTPSErrors: true,
    };
  } else {
    // running locally.
    puppeteer = require('puppeteer');
    console.log('running locally');
  }

  try {
    // Launch a headless browser
    browser = await puppeteer.launch(launchArgs);
    console.log('browser initialized');
    const page = await browser.newPage();
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
