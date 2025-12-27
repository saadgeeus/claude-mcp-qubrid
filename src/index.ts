#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import puppeteer, { Browser, Page } from "puppeteer";

// Qubrid API Configuration
const QUBRID_API_URL = "https://platform.qubrid.com/api/v1/qubridai/chat/completions";
const QUBRID_API_KEY = process.env.QUBRID_API_KEY || "k_a842f33543fd.ddmBPniMErSvDLUOLbUfnorNqoNs50n8Goppwhg8VaGQ-ickajmslA";

// Browser state
let browser: Browser | null = null;
let page: Page | null = null;

// Create MCP Server
const server = new Server(
    {
        name: "claude-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "hello",
                description: "Returns a greeting message",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Name to greet" },
                    },
                    required: ["name"],
                },
            },
            {
                name: "get_time",
                description: "Returns the current date and time",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "calculate",
                description: "Performs basic math operations",
                inputSchema: {
                    type: "object",
                    properties: {
                        operation: { type: "string", enum: ["add", "subtract", "multiply", "divide"] },
                        a: { type: "number", description: "First number" },
                        b: { type: "number", description: "Second number" },
                    },
                    required: ["operation", "a", "b"],
                },
            },
            {
                name: "qubrid_chat",
                description: "Send a prompt to Qubrid AI and get a response",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: { type: "string", description: "The prompt to send" },
                        model: { type: "string", description: "Model to use (default: openai/gpt-oss-120b)" },
                    },
                    required: ["prompt"],
                },
            },
            // Browser Control Tools
            {
                name: "browser_open",
                description: "Opens a browser and navigates to a URL",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string", description: "URL to navigate to" },
                        headless: { type: "boolean", description: "Run in headless mode (default: false)" },
                    },
                    required: ["url"],
                },
            },
            {
                name: "browser_screenshot",
                description: "Takes a screenshot of the current page",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: { type: "string", description: "File path to save screenshot" },
                        fullPage: { type: "boolean", description: "Capture full page (default: false)" },
                    },
                    required: ["path"],
                },
            },
            {
                name: "browser_click",
                description: "Clicks on an element by CSS selector",
                inputSchema: {
                    type: "object",
                    properties: {
                        selector: { type: "string", description: "CSS selector of element to click" },
                    },
                    required: ["selector"],
                },
            },
            {
                name: "browser_type",
                description: "Types text into an input field",
                inputSchema: {
                    type: "object",
                    properties: {
                        selector: { type: "string", description: "CSS selector of input field" },
                        text: { type: "string", description: "Text to type" },
                    },
                    required: ["selector", "text"],
                },
            },
            {
                name: "browser_get_text",
                description: "Gets text content from an element",
                inputSchema: {
                    type: "object",
                    properties: {
                        selector: { type: "string", description: "CSS selector of element" },
                    },
                    required: ["selector"],
                },
            },
            {
                name: "browser_navigate",
                description: "Navigates to a new URL in the current browser",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string", description: "URL to navigate to" },
                    },
                    required: ["url"],
                },
            },
            {
                name: "browser_close",
                description: "Closes the browser",
                inputSchema: { type: "object", properties: {} },
            },
        ],
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
        case "hello": {
            return { content: [{ type: "text", text: `Hello, ${args?.name || "World"}! 👋` }] };
        }

        case "get_time": {
            return { content: [{ type: "text", text: `Current time: ${new Date().toLocaleString()}` }] };
        }

        case "calculate": {
            const { operation, a, b } = args as { operation: string; a: number; b: number };
            let result: number;
            switch (operation) {
                case "add": result = a + b; break;
                case "subtract": result = a - b; break;
                case "multiply": result = a * b; break;
                case "divide": result = b !== 0 ? a / b : NaN; break;
                default: throw new Error(`Unknown operation: ${operation}`);
            }
            return { content: [{ type: "text", text: `${a} ${operation} ${b} = ${result}` }] };
        }

        case "qubrid_chat": {
            const { prompt, model = "openai/gpt-oss-120b" } = args as { prompt: string; model?: string };
            try {
                const response = await fetch(QUBRID_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${QUBRID_API_KEY}`,
                    },
                    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 1024 }),
                });
                if (!response.ok) throw new Error(`Qubrid API error: ${response.status}`);
                const data = await response.json() as { choices: Array<{ message: { content: string } }> };
                return { content: [{ type: "text", text: data.choices?.[0]?.message?.content || "No response" }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
            }
        }

        // Browser Control Tools
        case "browser_open": {
            const { url, headless = false } = args as { url: string; headless?: boolean };
            try {
                if (browser) await browser.close();
                browser = await puppeteer.launch({ headless, args: ["--start-maximized"] });
                page = await browser.newPage();
                await page.setViewport({ width: 1920, height: 1080 });
                await page.goto(url, { waitUntil: "networkidle2" });
                return { content: [{ type: "text", text: `Browser opened and navigated to: ${url}` }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
            }
        }

        case "browser_screenshot": {
            const { path: filePath, fullPage = false } = args as { path: string; fullPage?: boolean };
            if (!page) return { content: [{ type: "text", text: "Error: No browser open. Use browser_open first." }] };
            try {
                await page.screenshot({ path: filePath, fullPage });
                return { content: [{ type: "text", text: `Screenshot saved to: ${filePath}` }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
            }
        }

        case "browser_click": {
            const { selector } = args as { selector: string };
            if (!page) return { content: [{ type: "text", text: "Error: No browser open. Use browser_open first." }] };
            try {
                await page.click(selector);
                return { content: [{ type: "text", text: `Clicked on: ${selector}` }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
            }
        }

        case "browser_type": {
            const { selector, text } = args as { selector: string; text: string };
            if (!page) return { content: [{ type: "text", text: "Error: No browser open. Use browser_open first." }] };
            try {
                await page.type(selector, text);
                return { content: [{ type: "text", text: `Typed "${text}" into: ${selector}` }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
            }
        }

        case "browser_get_text": {
            const { selector } = args as { selector: string };
            if (!page) return { content: [{ type: "text", text: "Error: No browser open. Use browser_open first." }] };
            try {
                const text = await page.$eval(selector, el => el.textContent);
                return { content: [{ type: "text", text: text || "(empty)" }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
            }
        }

        case "browser_navigate": {
            const { url } = args as { url: string };
            if (!page) return { content: [{ type: "text", text: "Error: No browser open. Use browser_open first." }] };
            try {
                await page.goto(url, { waitUntil: "networkidle2" });
                return { content: [{ type: "text", text: `Navigated to: ${url}` }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
            }
        }

        case "browser_close": {
            if (!browser) return { content: [{ type: "text", text: "No browser is open." }] };
            try {
                await browser.close();
                browser = null;
                page = null;
                return { content: [{ type: "text", text: "Browser closed." }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
            }
        }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}

main().catch(console.error);
