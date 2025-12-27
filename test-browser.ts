// Test script for browser MCP tools
import puppeteer from "puppeteer";

async function testBrowser() {
    console.log("🚀 Starting browser test...");

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--start-maximized"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("📡 Navigating to Google...");
    await page.goto("https://www.google.com", { waitUntil: "networkidle2" });

    console.log("✅ Browser opened! Taking screenshot...");
    await page.screenshot({ path: "C:/Users/Taimoor/google-test.png" });

    console.log("📸 Screenshot saved to C:/Users/Taimoor/google-test.png");
    console.log("🎉 Test complete! Browser will close in 5 seconds...");

    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
}

testBrowser().catch(console.error);
