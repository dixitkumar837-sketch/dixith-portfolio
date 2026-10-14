import { chromium } from "playwright";

const SYSTEMS_URLS = [
  { name: "Google AI Overview", url: "https://www.google.com/search?q=What+is+the+HTTP+status+code+for+Moved+Permanently+according+to+RFC+9110%3F&hl=en" },
  { name: "ChatGPT", url: "https://chatgpt.com/" },
  { name: "Perplexity", url: "https://www.perplexity.ai/search?q=What+is+the+HTTP+status+code+for+Moved+Permanently+according+to+RFC+9110%3F" },
  { name: "Claude", url: "https://claude.ai/" },
  { name: "Gemini", url: "https://gemini.google.com/" },
  { name: "Microsoft Copilot", url: "https://copilot.microsoft.com/" },
];

async function testProbe() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  for (const sys of SYSTEMS_URLS) {
    console.log(`\n--- Probing: ${sys.name} ---`);
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      locale: "en-US",
    });
    const page = await context.newPage();
    try {
      const resp = await page.goto(sys.url, { waitUntil: "domcontentloaded", timeout: 15000 });
      const currentUrl = page.url();
      const title = await page.title();
      console.log(`Status: ${resp?.status()}`);
      console.log(`Current URL: ${currentUrl}`);
      console.log(`Title: ${title}`);

      // Check for auth / login requirement indicators
      const content = await page.content();
      const requiresLogin = /sign in|log in|login|accounts\.google\.com|cloudflare|verify you are human|captcha/i.test(title + " " + currentUrl);
      console.log(`Requires Auth / Cloudflare indicator: ${requiresLogin}`);
    } catch (err: any) {
      console.log(`Error during probe: ${err.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
}

testProbe();
