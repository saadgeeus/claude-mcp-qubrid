# CLAUDE.md — MCP Server Project Guide

## Build & Development

- **Install:** `npm install`
- **Build:** `npm run build`
- **Dev:** `npm run dev`
- **Start:** `npm start`

## Architecture Overview

This is a TypeScript MCP (Model Context Protocol) server built with Node.js and the `@modelcontextprotocol/sdk`. The entry point is `src/index.ts` which creates an MCP server that communicates via stdio. The server provides utility tools (`hello`, `get_time`, `calculate`) and integrates with Qubrid AI API for LLM chat capabilities via the `qubrid_chat` tool.

**Key Folders:**

- `src/` - TypeScript source code
- `dist/` - Compiled JavaScript output

## Available Tools

| Tool | Description |
|------|-------------|
| `hello` | Returns a greeting message |
| `get_time` | Returns current date/time |
| `calculate` | Basic math operations |
| `qubrid_chat` | Send prompts to Qubrid AI |
| `browser_open` | Opens browser and navigates to URL |
| `browser_screenshot` | Takes screenshot of current page |
| `browser_click` | Clicks on element by CSS selector |
| `browser_type` | Types text into input field |
| `browser_get_text` | Gets text content from element |
| `browser_navigate` | Navigates to a new URL |
| `browser_close` | Closes the browser |

## Environment Variables

- `QUBRID_API_KEY` - Qubrid API key (optional, has default)

## Coding Standards

- Use TypeScript strict mode
- ES modules with NodeNext resolution
- Clear, descriptive variable names

## Important Rules

- All MCP tools must have proper input schemas with descriptions
- Error responses should use the standard MCP error format
- Keep tool implementations focused and single-purpose
- Use environment variables for sensitive configuration (API keys)
