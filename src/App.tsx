import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { useStore } from "./store/useStore";
import { PenTool, Moon, Sun, Monitor } from "lucide-react";
import { Tooltip } from "./components/ui/Tooltip";

function Layout() {
  const { darkMode, toggleDarkMode } = useStore();

  const getDarkModeIcon = () => {
    if (darkMode === "auto") return <Monitor size={20} />;
    if (darkMode) return <Moon size={20} />;
    return <Sun size={20} />;
  };

  const getDarkModeTooltip = () => {
    if (darkMode === "auto") return "自动（跟随系统）";
    if (darkMode) return "暗黑模式";
    return "浅色模式";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
                  <PenTool size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                    AI 组件生成器
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    智能生成前端组件
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <Tooltip content={getDarkModeTooltip()}>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-all"
                >
                  {getDarkModeIcon()}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="py-6 text-center border-t border-gray-200 dark:border-slate-800 max-w-[1800px] mx-auto bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          {/* Logo and brand */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <PenTool size={16} />
            <span className="font-medium">AI Component Generator</span>
          </div>

          {/* Links section */}
          <div className="flex items-center gap-4 text-sm">
            {/* GitHub link */}
            <a
              href="https://github.com/lanqiang101/ai-component-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>GitHub</span>
            </a>

            {/* Separator */}
            <span className="text-gray-300 dark:text-gray-600">|</span>

            {/* Sponsor link */}
            <a
              href="https://paypal.me/lanqiang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all font-medium"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
              </svg>
              <span>Sponsor</span>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} AI Component Generator. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// 需要 Outlet 组件
import { Outlet } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      // { path: "config", element: <ConfigPage /> },
      // { path: "models", element: <ModelManagementPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
