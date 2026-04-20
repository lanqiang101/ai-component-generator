
import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { useStore } from './store/useStore';
import { PenTool, Moon, Sun, Monitor } from 'lucide-react';
import { Tooltip } from './components/ui/Tooltip';

function Layout() {
  const { darkMode, toggleDarkMode, loadModels } = useStore();
  const location = useLocation();

  // 加载数据
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // 处理暗黑模式
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode === 'auto') {
      root.classList.remove('dark');
    } else if (darkMode) {
      root.classList.add('dark');
      root.style.setProperty('--bg-gradient-from', '#0f172a');
      root.style.setProperty('--bg-gradient-to', '#020617');
      root.style.setProperty('--card-bg', '#1e293b');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--border-color', '#334155');
    } else {
      root.classList.remove('dark');
      root.style.removeProperty('--bg-gradient-from');
      root.style.removeProperty('--bg-gradient-to');
      root.style.removeProperty('--card-bg');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--text-secondary');
      root.style.removeProperty('--border-color');
    }
  }, [darkMode]);

  const getDarkModeIcon = () => {
    if (darkMode === 'auto') return <Monitor size={20} />;
    if (darkMode) return <Moon size={20} />;
    return <Sun size={20} />;
  };

  const getDarkModeTooltip = () => {
    if (darkMode === 'auto') return '自动（跟随系统）';
    if (darkMode) return '暗黑模式';
    return '浅色模式';
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

            <nav className="hidden md:flex items-center gap-1">
              <a
                href="/"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  location.pathname === '/'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                生成器
              </a>
            </nav>

            <div className="flex items-center gap-2">
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

      <footer className="py-4 text-center text-gray-400 dark:text-gray-500 text-xs border-t border-gray-200 dark:border-slate-800 max-w-[1800px] mx-auto">
        <div className="flex items-center justify-center gap-2">
          <PenTool size={14} />
          <span>AI Component Generator</span>
        </div>
      </footer>
    </div>
  );
}

// 需要 Outlet 组件
import { Outlet } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
