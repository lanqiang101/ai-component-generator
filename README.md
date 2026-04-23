# AI Component Generator

An AI-powered frontend component generator that automatically generates React/Vue/HTML component code using large language models.

[中文版本](./README_zh.md)

## ✨ Features

- 🤖 **Smart Requirement Analysis** - AI automatically analyzes requirements and generates component structure, features, and code
- 🎯 **Multiple Framework Support** - React (TSX/JSX), Vue 3 (SFC), plain HTML/CSS/JS
- 🎨 **Rich Configuration Options**:
  - Multiple UI design styles (Minimal, Neumorphism, Glassmorphism, Cyberpunk, Retro, Material Design, Ant Design)
  - Dynamic UI library selection (automatically filtered by framework)
  - Supports CSS/SCSS/LESS/Tailwind CSS style preprocessing
  - Mock data toggle, editable after generation
  - Interactive event configuration
- 🔄 **Real-time Preview** - Preview updates immediately after code editing
- 📱 **Resolution Switching** - Preview with preset resolutions: mobile/tablet/laptop/desktop/fullscreen
- 💾 **No Database Required** - Model configuration stored in browser localStorage
- 🌓 **Dark Mode** - Supports auto/light/dark theme modes
- 📝 **Code Editor** - Syntax highlighting, copy & download
- 🔒 **Secure Architecture** - Uses Cloudflare Worker to encrypt and proxy API Keys for security
- 🚀 **Out-of-the-box** - Built-in Volcengine model configuration, no complex setup required

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The project is already configured with the official Worker URL, ready to use:

```bash
# Already configured in .env file
VITE_AI_PROXY_URL=https://ai-component-proxy.xuyongqiang916.workers.dev
AI_PROXY_URL=https://ai-component-proxy.xuyongqiang916.workers.dev
```

### 3. Test Worker Connection

```bash
# Test if Worker is accessible
npm run test:worker
```

**⚠️ Network Notice for China Users**:
- Cloudflare Workers may be restricted in mainland China
- If you encounter connection timeout, try:
  - Use a proxy or VPN
  - Deploy your own Worker to overseas nodes
  - Check firewall settings

### 4. Start Development Server

```bash
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 5. Build for Production

```bash
npm run build
```

## 📖 Usage Flow

1. **Configure Model** - Ensure `.env` has the correct Cloudflare Worker address, or check configuration in "Model Management" on the frontend (if using local proxy).
2. **Fill Requirements** - Fill in component requirements on the homepage:
   - Component name and description (with AI expansion feature)
   - Choose framework and component type
   - Select UI design style
   - Choose UI library (optional, with version selection)
   - Choose style preprocessor
   - Configure whether you need mock data and interactions
   - Add extra requirements
3. **Generate Component** - Click "Generate Component" button (or press `Ctrl/Cmd + Enter`)
4. **Review Requirements** - AI will analyze and refine your requirements, showing component structure, features, and technical notes
5. **Preview & Edit** - Preview on the right, edit in code editor, preview updates in real-time
6. **Switch Resolution** - Switch different resolutions in preview bar to check responsiveness
7. **Export Code** - Copy or download code for use in your project

## 🗂️ Project Structure

```
ai-component-generator/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   │   ├── ui/           # Basic UI components (Button, Card, Input, etc.)
│   │   ├── LeftFormPanel.tsx      # Left configuration form
│   │   ├── PreviewPanel.tsx       # Preview panel
│   │   ├── CodeEditorPanel.tsx    # Code editor
│   │   ├── GenerateButton.tsx     # Generate button
│   │   └── GenerationProgress.tsx # Generation progress indicator
│   ├── pages/            # Page components
│   │   └── HomePage.tsx  # Main generator page
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── constants/        # Constants (resolutions, UI libraries)
│   └── utils/            # Utility functions
├── server/                # Backend service (local development proxy)
│   └── index.js          # Express server
├── worker/                # Cloudflare Worker (production environment proxy)
│   ├── index.js          # Worker code
│   └── wrangler.toml     # Wrangler configuration
├── docs/                  # Documentation
│   └── cloudflare-worker.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example          # Environment variable example
```

## 🎛️ Supported Options

### Frameworks
- React 18 + TypeScript (TSX)
- React 18 + JavaScript (JSX)
- Vue 3 + TypeScript (.vue)
- Vue 3 + JavaScript (.vue)
- Plain HTML + CSS + JavaScript

### Component Types
- Button
- Card
- Form
- Navbar
- Modal
- Dropdown
- Table
- Chart
- Other Custom

### UI Libraries (Dynamic)

**React:**
- None (native)
- Ant Design
- Material UI
- Chakra UI
- Mantine
- Shadcn UI

**Vue:**
- None (native)
- Element Plus
- Ant Design Vue
- Vuetify
- Naive UI

**HTML:**
- None (native)
- Bootstrap
- Tailwind CSS

### Style Preprocessors
- Plain CSS
- SCSS
- LESS
- Tailwind CSS

### Design Styles
- Minimal Modern
- Neumorphism
- Glassmorphism
- Cyberpunk
- Retro
- Material Design
- Ant Design Style

### Preview Resolutions
- Mobile 360×640
- Tablet 768×1024
- Laptop 1366×768
- Desktop 1920×1080
- Fullscreen adaptive

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v3
- **State Management**: Zustand
- **UI Components**: Radix UI Primitives (Dialog, Select, Switch, Tabs)
- **Icons**: Lucide React
- **Code Editor**: react-simple-code-editor + Prism.js
- **Backend**: Node.js + Express (local development)
- **AI Model**: Volcengine Ark (ark-code-latest)
- **Security Proxy**: Cloudflare Workers
- **Routing**: React Router DOM v7

## ⚙️ API Configuration

The project comes with built-in configuration, **no manual setup required** (when using the recommended Cloudflare Worker proxy):

| Configuration | Value |
|--------------|-------|
| Base URL | `https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions` |
| Model ID | `ark-code-latest` |
| Temperature | 0.7 |
| Max Tokens | 4096 |

All API requests are proxied through Cloudflare Worker, with API Key securely stored in Cloudflare environment variables.

## 🛠️ Development Guide

### Local Worker Development

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Run Worker locally
npm run dev:worker
```

### Deploy Worker

```bash
# Deploy to Cloudflare
npm run deploy:worker
```

### Securely Configure API Key

```bash
# Set secret using wrangler (won't be exposed in code)
wrangler secret put ARK_API_KEY
```

## ❓ Troubleshooting

### Worker Returns 500 Error

1. Check Cloudflare Worker logs
2. Confirm `ARK_API_KEY` environment variable is configured
3. Verify API Key is valid

### Frontend Request Fails

1. Check browser console network requests
2. Confirm `VITE_AI_PROXY_URL` is configured correctly
3. Verify Worker is active

For detailed troubleshooting, see: [Cloudflare Worker Deployment Guide](./docs/cloudflare-worker.md#troubleshooting)

## 🔒 Security Recommendations

- ✅ API Key stored in Cloudflare environment variables, not exposed in code
- ✅ Rotate API Key regularly
- ✅ Monitor Worker usage
- ✅ Do NOT commit `.env` files to Git

## 💰 Cost Information

- **Cloudflare Workers**: 100,000 free requests per month
- **Volcengine Ark API**: Pay-as-you-go, see [official pricing](https://www.volcengine.com/pricing)

## 📄 License

MIT License
