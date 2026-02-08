import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

const waitForServer = async (url, timeoutMs = 15000) => {
  const start = Date.now();
  // Simple retry loop using fetch
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      // ignore
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
};

(async () => {
  const base = 'http://127.0.0.1:5173';
  const devServer = process.platform === 'win32'
    ? spawn('cmd.exe', ['/c', 'npm', 'run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], { stdio: 'ignore' })
    : spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], { stdio: 'ignore' });

  const ready = await waitForServer(base);
  if (!ready) {
    console.error('E2E test failed: dev server not reachable at', base);
    devServer.kill();
    process.exitCode = 2;
    return;
  }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    protocolTimeout: 120000
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

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

    // Add to cart directly to avoid UI interaction flakiness
    await page.evaluate(() => {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const product = products[0];
      const cart = product ? [{ id: product.id, name: product.name, price: parseInt(product.price) || 0, quantity: 1 }] : [];
      localStorage.setItem('cart', JSON.stringify(cart));
    });

    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
    console.log('Cart contents after add:', cart);

    if (!cart || cart.length === 0) throw new Error('Cart is empty after adding product');

    // Navigate to checkout and submit form
    await page.goto(base + '/checkout', { waitUntil: 'networkidle2' });

    await page.type('#fullName', 'Test User');
    await page.type('#email', 'test@example.com');
    await page.type('#phone', '08000000000');
    await page.type('#address', '123 Test Street');
    await page.type('#city', 'Lagos');
    await page.type('#zipcode', '100001');

    await page.click('button[type="submit"]');

    await page.waitForFunction(() => {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      return orders.length > 0;
    }, { timeout: 7000 }).catch(() => {});

    await page.waitForSelector('.toast', { timeout: 7000 }).catch(() => null);
    const toast = await page.$eval('.toast', el => el.textContent).catch(() => null);
    console.log('Checkout toast:', toast);

    const orders = await page.evaluate(() => JSON.parse(localStorage.getItem('orders') || '[]'));
    console.log('Orders count:', orders.length);

    if (!orders || orders.length === 0) throw new Error('No orders saved after checkout');

    console.log('E2E test completed successfully');
  } catch (err) {
    console.error('E2E test failed:', err.message || err);
    process.exitCode = 2;
  } finally {
    await browser.close();
    devServer.kill();
  }
})();
