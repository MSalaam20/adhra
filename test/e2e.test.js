const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const base = 'http://localhost:5173';

  try {
    console.log('Opening home page...');
    await page.goto(base, { waitUntil: 'networkidle2' });

    // Check demo product presence
    const firstTitle = await page.$eval('.product-card h3', el => el.textContent).catch(() => null);
    console.log('First product title:', firstTitle);

    // Inject a product into localStorage
    await page.evaluate(() => {
      const products = [
        { id: 12345, name: 'E2E Product', price: '2500', description: 'Added by e2e test', image: '/assets/logo.png' }
      ];
      localStorage.setItem('products', JSON.stringify(products));
      localStorage.removeItem('cart');
    });

    await page.reload({ waitUntil: 'networkidle2' });
    const newTitle = await page.$eval('.product-card h3', el => el.textContent).catch(() => null);
    console.log('After injecting product, first product title:', newTitle);

    if (!newTitle || !newTitle.includes('E2E Product')) {
      throw new Error('Injected product not visible on home page');
    }

    // Click Add to Cart
    await page.click('.add-to-cart');
    await page.waitForTimeout(300);

    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
    console.log('Cart contents after add:', cart);

    if (!cart || cart.length === 0) throw new Error('Cart is empty after adding product');

    // Navigate to checkout and submit form
    await page.goto(base + '/checkout', { waitUntil: 'networkidle2' });

    await page.type('#fullName', 'Test User');
    await page.type('#email', 'test@example.com');
    await page.type('#phone', '08000000000');
    await page.type('#address', '123 Test Street');

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {})
    ]);

    const message = await page.$eval('.message', el => el.textContent).catch(() => null);
    console.log('Checkout message:', message);

    const orders = await page.evaluate(() => JSON.parse(localStorage.getItem('orders') || '[]'));
    console.log('Orders count:', orders.length);

    if (!orders || orders.length === 0) throw new Error('No orders saved after checkout');

    console.log('E2E test completed successfully');
  } catch (err) {
    console.error('E2E test failed:', err.message || err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
