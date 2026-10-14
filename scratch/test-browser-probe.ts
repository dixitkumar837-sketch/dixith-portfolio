import { chromium } from "playwright";

async function probe() {
  console.log("Probing browser launch with system Chrome...");
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
    console.log("Successfully launched Chrome!");
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      locale: "en-US",
    });
    const page = await context.newPage();
    console.log("Navigating to example.com to test DOM & screenshot capture...");
    await page.goto("https://example.com", { waitUntil: "domcontentloaded", timeout: 15000 });
    const title = await page.title();
    console.log("Page title:", title);
    const html = await page.content();
    console.log("HTML length:", html.length);
    const screenshot = await page.screenshot({ fullPage: true });
    console.log("Screenshot bytes:", screenshot.byteLength);
    await context.close();
    await browser.close();
    console.log("Browser probe test successful!");
  } catch (err) {
    console.error("Browser probe failed:", err);
    if (browser) await browser.close();
  }
}

probe();
