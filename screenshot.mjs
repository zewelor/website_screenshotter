import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Normalize URL - add https:// if no scheme provided
function normalizeUrl(url) {
  if (!url) return { url: 'https://example.com', wasModified: false };

  // Check if URL has a scheme
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) {
    return { url: `https://${url}`, wasModified: true };
  }
  return { url, wasModified: false };
}

const rawUrl = process.env.URL || process.argv[2] || '';
const { url: normalizedUrl, wasModified: urlWasModified } = normalizeUrl(rawUrl);

// Configuration
const config = {
  url: normalizedUrl,
  outputDir: process.env.OUTPUT_DIR || './output',
  timeout: parseInt(process.env.TIMEOUT) || 30000,
  scrollStep: parseInt(process.env.SCROLL_STEP) || 800,
  scrollDelay: parseInt(process.env.SCROLL_DELAY) || 500,
  viewports: {
    desktop: {
      width: parseInt(process.env.DESKTOP_WIDTH) || 1920,
      height: parseInt(process.env.DESKTOP_HEIGHT) || 1080,
    },
    mobile: {
      width: parseInt(process.env.MOBILE_WIDTH) || 390,
      height: parseInt(process.env.MOBILE_HEIGHT) || 844,
    },
  },
};

async function ensureOutputDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function takeScrollingScreenshots(page, device, outputDir) {
  const screenshots = [];
  let scrollPosition = 0;
  let index = 0;

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  console.log(`  Total page height: ${totalHeight}px`);
  console.log(`  Viewport height: ${viewportHeight}px`);

  while (scrollPosition < totalHeight) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollPosition);
    await page.waitForTimeout(config.scrollDelay);

    const filename = `${device}_${String(index).padStart(3, '0')}.png`;
    const filepath = `${outputDir}/${filename}`;

    await page.screenshot({ path: filepath });
    screenshots.push(filepath);
    console.log(`  Captured: ${filename} (scroll: ${scrollPosition}px)`);

    index++;
    scrollPosition += config.scrollStep;
  }

  return screenshots;
}

async function captureFullPage(page, device, outputDir) {
  const filename = `${device}_full.png`;
  const filepath = `${outputDir}/${filename}`;

  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  Full page screenshot: ${filename}`);

  return filepath;
}

async function run() {
  console.log('='.repeat(50));
  console.log('Webpage Screenshot Tool');
  console.log('='.repeat(50));
  if (urlWasModified) {
    console.log(`URL: ${config.url} (https:// added automatically)`);
  } else {
    console.log(`URL: ${config.url}`);
  }
  console.log(`Output: ${config.outputDir}`);
  console.log('');

  await ensureOutputDir(config.outputDir);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Desktop screenshots
    console.log(`[Desktop] ${config.viewports.desktop.width}x${config.viewports.desktop.height}`);
    const desktopContext = await browser.newContext({
      viewport: config.viewports.desktop,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(config.url, { waitUntil: 'networkidle', timeout: config.timeout });

    await takeScrollingScreenshots(desktopPage, 'desktop', config.outputDir);
    await captureFullPage(desktopPage, 'desktop', config.outputDir);
    await desktopContext.close();

    // Mobile screenshots
    console.log('');
    console.log(`[Mobile] ${config.viewports.mobile.width}x${config.viewports.mobile.height}`);
    const mobileContext = await browser.newContext({
      viewport: config.viewports.mobile,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(config.url, { waitUntil: 'networkidle', timeout: config.timeout });

    await takeScrollingScreenshots(mobilePage, 'mobile', config.outputDir);
    await captureFullPage(mobilePage, 'mobile', config.outputDir);
    await mobileContext.close();

    console.log('');
    console.log('Done! Screenshots saved to:', config.outputDir);

  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
