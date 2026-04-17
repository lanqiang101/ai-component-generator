# AI Frontend Component Generator

AI-powered frontend component generator. Configure your component requirements via a form, AI generates code for your chosen framework/language, with real-time preview and editing.

[中文版](./README.md)

## ✨ Features

- 🤖 **Multiple Frameworks Support** - React (TSX/JSX), Vue 3 (SFC), plain HTML/CSS/JS
- 🎨 **Rich Configuration Options**
  - Multiple UI design styles (minimal, neumorphism, glassmorphism, cyberpunk, retro, etc.)
  - Dynamic UI library selection (filtered automatically by framework)
  - Supports CSS/SCSS/LESS/Tailwind CSS style preprocessing
  - Mock data toggle, editable after generation
- 🔄 **Real-time Preview** - Preview updates immediately after code editing
- 📱 **Resolution Switching** - Preview with preset resolutions: mobile/tablet/laptop/desktop/fullscreen
- 💾 **No Database Required** - Model configuration stored in browser localStorage
- 🌓 **Dark Mode** - Supports auto/light/dark theme modes
- 📝 **Code Editor** - Syntax highlighting, copy & download

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`  
Backend API runs at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

## 📖 Usage Flow

1. **Add Model** - Go to "Model Management" to add your AI model (supports local Ollama or cloud APIs like Volcengine/OpenAI)
2. **Select Model** - Go to "Model Config" to select the model for component generation
3. **Fill Requirements** - Fill in component requirements on the homepage:
   - Component name and description
   - Choose framework and component type
   - Select UI design style
   - Choose UI library (optional)
   - Choose style preprocessor
   - Configure whether you need mock data and interactions
   - Add extra requirements
4. **Generate Component** - Click "Generate Component" button (or press `Ctrl/Cmd + Enter`)
5. **Preview & Edit** - Preview on the right, edit in code editor, preview updates in real-time
6. **Switch Resolution** - Switch different resolutions in preview bar to check responsiveness
7. **Export Code** - Copy or download code for use in your project

## 🗂️ Project Structure

```
ai-component-generator/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.cjs
├── .gitignore
├── README.md          # Chinese README
├── README-EN.md       # This file
├── requirements.md     # Requirements document
├── server/
│   └── index.js        # Express backend (API proxy only)
└── src/
    ├── main.tsx        # React entry
    ├── App.tsx         # Root component + routing
    ├── index.css       # Global styles
    ├── types/
    │   ├── index.ts    # TypeScript type definitions
    │   └── defaults.ts # Default parameters
    ├── constants/
    │   ├── resolutions.ts  # Resolution presets
    │   └── ui-libraries.ts # UI library options
    ├── store/
    │   └── useStore.ts # Zustand state management
    ├── pages/
    │   ├── HomePage.tsx      # Generator homepage
    │   ├── ConfigPage.tsx    # System configuration
    │   └── ModelManagementPage.tsx  # Model management
    │       └── ModelDialog.tsx # Add/edit model dialog
    └── components/
        ├── ui/               # Basic UI components
        ├── LeftFormPanel.tsx # Left configuration form
        ├── PreviewPanel.tsx  # Preview panel
        └── CodeEditorPanel.tsx # Code editor
```

## 🎛️ Supported Options

### Frameworks
- React 18 + TypeScript (TSX)
- React 18 + JavaScript (JSX)
- Vue 3 + TypeScript (.vue)
- Vue 3 + JavaScript (.vue)
- Plain HTML + CSS + JavaScript

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

- React 18 + TypeScript + Vite
- Tailwind CSS v3
- Zustand (state management)
- Radix UI (interaction primitives)
- Express (backend API proxy)
- Prism.js (syntax highlighting)
- Lucide React (icons)

## 📝 Notes

- All model configurations stored in browser `localStorage`, no database required
- All AI API requests proxied through backend to avoid CORS issues
- Supports both local models (e.g., Ollama) and cloud API models
- Preview runs in an isolated iframe, doesn't affect the main app

## 📄 License

MIT
