#!/usr/bin/env node
import puppeteer, { Browser, Page } from "puppeteer";
import * as readline from "readline";

// Browser state
let browser: Browser | null = null;
let page: Page | null = null;

// Parse user command locally (fast, no API needed)
function parseCommand(input: string): { tool: string; params: Record<string, any> } | null {
    const lower = input.toLowerCase().trim();

    // Open URL patterns
    if (lower.startsWith("open ")) {
        let url = input.slice(5).trim();
        if (!url.startsWith("http")) {
            // Handle common sites
            if (url === "google" || url === "google.com") url = "https://www.google.com";
            else if (url === "youtube" || url === "youtube.com") url = "https://www.youtube.com";
            else if (url === "github" || url === "github.com") url = "https://www.github.com";
            else if (url === "twitter" || url === "x" || url === "x.com") url = "https://www.x.com";
            else url = `https://${url}`;
        }
        return { tool: "browser_open", params: { url } };
    }

    // Navigate
    if (lower.startsWith("go to ") || lower.startsWith("navigate ")) {
        let url = input.replace(/^(go to |navigate )/i, "").trim();
        if (!url.startsWith("http")) url = `https://${url}`;
        return { tool: "browser_navigate", params: { url } };
    }

    // Click
    if (lower.startsWith("click ")) {
        const selector = input.slice(6).trim();
        return { tool: "browser_click", params: { selector } };
    }

    // Type
    const typeMatch = input.match(/type [\"'](.+?)[\"'] (?:in|into) (.+)/i);
    if (typeMatch) {
        return { tool: "browser_type", params: { text: typeMatch[1], selector: typeMatch[2] } };
    }
    if (lower.startsWith("type ")) {
        // Simple type command - type into focused element
        const text = input.slice(5).trim();
        return { tool: "browser_type", params: { text, selector: ":focus" } };
    }

    // Screenshot
    if (lower.includes("screenshot")) {
        const path = `C:/Users/Taimoor/screenshot-${Date.now()}.png`;
        return { tool: "browser_screenshot", params: { path } };
    }

    // Close browser
    if (lower === "close" || lower === "close browser") {
        return { tool: "browser_close", params: {} };
    }

    // Get time
    if (lower.includes("time") || lower.includes("what time")) {
        return { tool: "get_time", params: {} };
    }

    // Hello
    if (lower.startsWith("hello") || lower.startsWith("hi") || lower.startsWith("say hello")) {
        const name = input.replace(/^(hello|hi|say hello to?)/i, "").trim() || "World";
        return { tool: "hello", params: { name } };
    }

    // Calculate
    const calcMatch = input.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    if (calcMatch) {
        const [, a, op, b] = calcMatch;
        const opMap: Record<string, string> = { "+": "add", "-": "subtract", "*": "multiply", "/": "divide" };
        return { tool: "calculate", params: { operation: opMap[op], a: Number(a), b: Number(b) } };
    }

    return null;
}

// Tool execution
async function executeTool(name: string, params: Record<string, any>): Promise<string> {
    console.log(`\n🔧 Executing: ${name}`, params);

    try {
        switch (name) {
            case "browser_open": {
                if (browser) await browser.close();
                browser = await puppeteer.launch({ headless: false, args: ["--start-maximized"] });
                page = await browser.newPage();
                await page.setViewport({ width: 1920, height: 1080 });
                await page.goto(params.url, { waitUntil: "networkidle2", timeout: 30000 });
                return `✅ Browser opened: ${params.url}`;
            }
            case "browser_close": {
                if (browser) { await browser.close(); browser = null; page = null; }
                return "✅ Browser closed";
            }
            case "browser_navigate": {
                if (!page) return "❌ No browser open. Use 'open [url]' first.";
                await page.goto(params.url, { waitUntil: "networkidle2", timeout: 30000 });
                return `✅ Navigated to: ${params.url}`;
            }
            case "browser_click": {
                if (!page) return "❌ No browser open. Use 'open [url]' first.";
                await page.click(params.selector);
                return `✅ Clicked: ${params.selector}`;
            }
            case "browser_type": {
                if (!page) return "❌ No browser open. Use 'open [url]' first.";
                await page.type(params.selector, params.text);
                return `✅ Typed "${params.text}"`;
            }
            case "browser_screenshot": {
                if (!page) return "❌ No browser open. Use 'open [url]' first.";
                await page.screenshot({ path: params.path, fullPage: false });
                return `✅ Screenshot saved: ${params.path}`;
            }
            case "browser_get_text": {
                if (!page) return "❌ No browser open. Use 'open [url]' first.";
                const text = await page.$eval(params.selector, el => el.textContent);
                return `📄 Text: ${text}`;
            }
            case "get_time": {
                return `🕐 Current time: ${new Date().toLocaleString()}`;
            }
            case "calculate": {
                const { operation, a, b } = params;
                let result: number;
                switch (operation) {
                    case "add": result = a + b; break;
                    case "subtract": result = a - b; break;
                    case "multiply": result = a * b; break;
                    case "divide": result = b !== 0 ? a / b : NaN; break;
                    default: return `❌ Unknown operation: ${operation}`;
                }
                return `🔢 ${a} ${operation} ${b} = ${result}`;
            }
            case "hello": {
                return `👋 Hello, ${params.name}!`;
            }
            default:
                return `❌ Unknown tool: ${name}`;
        }
    } catch (error) {
        return `❌ Error: ${(error as Error).message}`;
    }
}

// Main CLI loop
async function main() {
    console.log("\n🤖 MCP Browser CLI - Powered by Puppeteer");
    console.log("━".repeat(45));
    console.log("Commands:");
    console.log("  open [url]      - Open browser (e.g., 'open google')");
    console.log("  click [sel]     - Click element");
    console.log("  type [text]     - Type text");
    console.log("  screenshot      - Take screenshot");
    console.log("  close           - Close browser");
    console.log("  exit            - Exit CLI\n");

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const prompt = () => {
        rl.question("You > ", async (input) => {
            const trimmed = input.trim();

            if (!trimmed) { prompt(); return; }

            if (trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit") {
                if (browser) await browser.close();
                console.log("👋 Goodbye!");
                rl.close();
                return;
            }

            const command = parseCommand(trimmed);

            if (command) {
                const result = await executeTool(command.tool, command.params);
                console.log(result);
            } else {
                console.log("❓ Unknown command. Try 'open google', 'screenshot', or 'exit'");
            }

            prompt();
        });
    };

    prompt();
}

main().catch(console.error);
