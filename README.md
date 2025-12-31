# 🤖 Claude Code Router + Qubrid AI Setup

Use Claude Code CLI with **FREE AI models** from Qubrid! This repository provides a complete setup guide and MCP server with browser automation.

## 🎯 What You Get

- **FREE AI Models** via Qubrid API
- **Claude Code CLI** working with Qubrid's models
- **MCP Server** with browser automation tools
- **Browser CLI** for web automation

---

## 📋 Table of Contents

- [Benefits](#-benefits)
- [Free Models Available](#-free-models-available)
- [Getting Qubrid API Key](#-getting-qubrid-api-key)
- [Claude Code Router Setup](#-claude-code-router-setup)
- [MCP Server & Browser CLI](#-mcp-server--browser-cli)
- [Usage Examples](#-usage-examples)

---

## ✨ Benefits

| Feature | Description |
|---------|-------------|
| 💸 **Free Tier** | Qubrid offers free tier access to AI models |
| 🚀 **No Anthropic API Needed** | Use Claude Code CLI without Anthropic subscription |
| 🤖 **Powerful Models** | Access GPT-OSS 120B, DeepSeek R1, Mistral 7B and more |
| 🌐 **OpenAI Compatible** | Works with any OpenAI-compatible tooling |
| 🔧 **Browser Automation** | Included MCP server with Puppeteer tools |

---

## 🆓 Free Models Available

Qubrid provides access to these models (free tier with pay-as-you-go for heavy usage):

| Model | Parameters | Best For |
|-------|------------|----------|
| **GPT-OSS 120B** | 120B | Advanced reasoning, enterprise automation |
| **GPT-OSS 20B** | 20B | Agentic tasks, MoE architecture |
| **DeepSeek R1 Distill LLaMA 70B** | 70B | High-level reasoning, conversational AI |
| **Nemotron Orchestrator 8B** | 8B | Agent workflows, task sequencing |
| **Mistral 7B Instruct** | 7.3B | Efficiency, instruction-following |
| **Fara 7B** | 7B | High-speed inference, lightweight reasoning |
| **Qwen3-VL-30B** | 30B | Vision-language tasks |

---

## 🔑 Getting Qubrid API Key

### Step 1: Create Account

1. Go to [**Qubrid Signup**](https://platform.qubrid.com/?ref=ref_saadgtsopz)
2. Click **Sign Up** and create an account
3. Verify your email

### Step 2: Get API Key

1. Log in to [Qubrid Platform](https://platform.qubrid.com)
2. Navigate to **API Keys** section (usually in Settings or Dashboard)
3. Click **Create New API Key**
4. Copy your API key - it looks like: `k_xxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 3: Save Your Key

Keep your API key safe! You'll use it in the Claude Code Router configuration.

---

## 🛠️ Claude Code Router Setup

### Prerequisites

- **Node.js** 18+ installed
- **npm** package manager
- **Windows/Mac/Linux**

### Step 1: Install Claude Code

```bash
# Install Claude Code CLI globally
npm install -g @anthropic-ai/claude-code
```

### Step 2: Install Claude Code Router

```bash
# Install the MusiStudio Claude Code Router
npm install -g @musistudio/claude-code-router
```

### Step 3: Create Configuration

Create the configuration directory and file:

```bash
# Windows
mkdir %USERPROFILE%\.claude-code-router

# Mac/Linux
mkdir -p ~/.claude-code-router
```

Create `config.json` in that directory:

**Windows:** `C:\Users\YOUR_USERNAME\.claude-code-router\config.json`
**Mac/Linux:** `~/.claude-code-router/config.json`

```json
{
  "LOG": true,
  "LOG_LEVEL": "info",
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "qubrid",
      "api_base_url": "https://platform.qubrid.com/api/v1/qubridai/chat/completions",
      "api_key": "YOUR_QUBRID_API_KEY_HERE",
      "models": [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b"
      ]
    }
  ],
  "Router": {
    "default": "qubrid,openai/gpt-oss-120b",
    "background": "qubrid,openai/gpt-oss-20b",
    "think": "qubrid,openai/gpt-oss-120b",
    "longContext": "qubrid,openai/gpt-oss-120b"
  }
}
```

**⚠️ Important:** Replace `YOUR_QUBRID_API_KEY_HERE` with your actual Qubrid API key!

### Step 4: Start the Router

```bash
# Start Claude Code Router
ccr start

# Check status
ccr status

# Check health
ccr health
```

You should see:

```
📊 Claude Code Router Status
════════════════════════════════════════
✅ Status: Running
🌐 Port: 3456
📡 API Endpoint: http://127.0.0.1:3456
```

### Step 5: Use Claude Code with Qubrid

```bash
# Start Claude Code through the router
ccr code

# Or run a one-shot prompt
ccr code -p "Say hello in one word"
```

### Router Commands Reference

| Command | Description |
|---------|-------------|
| `ccr start` | Start the router server |
| `ccr stop` | Stop the router server |
| `ccr restart` | Restart the router |
| `ccr status` | Show router status |
| `ccr health` | Check provider health |
| `ccr code` | Launch Claude Code with router |
| `ccr ui` | Open web UI |

---

## 🔧 MCP Server & Browser CLI

This repository includes an MCP server with browser automation tools.

### Installation

```bash
# Clone this repository
git clone https://github.com/YOUR_USERNAME/claude-mcp-qubrid.git
cd claude-mcp-qubrid

# Install dependencies
npm install

# Build
npm run build
```

### Available Tools

#### MCP Server Tools (via Claude Code)

| Tool | Description |
|------|-------------|
| `hello` | Greeting message |
| `get_time` | Current date/time |
| `calculate` | Math operations |
| `qubrid_chat` | Chat with Qubrid AI |
| `browser_open` | Open browser to URL |
| `browser_click` | Click element |
| `browser_type` | Type text |
| `browser_screenshot` | Take screenshot |
| `browser_navigate` | Navigate to URL |
| `browser_close` | Close browser |

#### Browser CLI (Standalone)

```bash
# Run the browser automation CLI
npx tsx src/cli.ts
```

**Commands:**

```
You > open google
🔧 Executing: browser_open { url: 'https://www.google.com' }
✅ Browser opened: https://www.google.com

You > screenshot
✅ Screenshot saved: C:/Users/Taimoor/screenshot-xxx.png

You > exit
👋 Goodbye!
```

### Register MCP Server with Claude Code

```bash
# Add to project
claude mcp add claude-mcp "node" "./dist/index.js" --scope project

# Or add globally
claude mcp add claude-mcp "node" "/path/to/dist/index.js"

# Verify
claude mcp list
```

---

## 📖 Usage Examples

### Basic Chat

```bash
ccr code -p "Explain quantum computing in simple terms"
```

### Interactive Session

```bash
ccr code
# Then chat naturally with the AI
```

### Browser Automation

```bash
npx tsx src/cli.ts
# Then:
# > open youtube
# > screenshot
# > close
```

---

## 🔧 Troubleshooting

### "API Error: 404"

- Check your Qubrid API key is correct
- Verify the API endpoint URL in config.json

### "getaddrinfo ENOTFOUND"

- Check your internet connection
- Verify the API URL: `https://platform.qubrid.com/api/v1/qubridai/chat/completions`

### Router not starting

```bash
ccr stop
ccr start
```

### MCP server not connecting

```bash
claude mcp list
# Should show: claude-mcp: ✓ Connected
```

---

## 📁 Project Structure

```
.
├── src/
│   ├── index.ts      # MCP server
│   └── cli.ts        # Browser CLI
├── dist/             # Compiled JS
├── package.json
├── tsconfig.json
├── CLAUDE.md         # Claude Code guidance
└── README.md         # This file
```

---

## 🔗 Resources

- [Qubrid Platform](https://platform.qubrid.com) - Get your API key
- [Qubrid Documentation](https://qubrid.com/docs) - API docs
- [Claude Code Router (MusiStudio)](https://www.npmjs.com/package/@musistudio/claude-code-router) - NPM package
- [MCP Protocol](https://modelcontextprotocol.io) - Model Context Protocol

---

## 📜 License

MIT License - Feel free to use and modify!

---

## 🙏 Credits

- **Qubrid AI** - For providing free access to powerful AI models
- **MusiStudio** - For the Claude Code Router package
- **Anthropic** - For Claude Code CLI
