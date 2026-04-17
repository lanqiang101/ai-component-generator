
import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ConfigPage } from './pages/ConfigPage';
import { ModelManagementPage } from './pages/ModelManagementPage';
import { useStore } from './store/useStore';
import { PenTool, Moon, Sun, Monitor } from 'lucide-react';
import { Tooltip } from './components/ui/Tooltip';

function Layout() {
  const { darkMode, toggleDarkMode, loadModels, loadSystemConfig } = useStore();

  // 加载数据
  useEffect(() => {
    loadModels();
    loadSystemConfig();
  }, [loadModels, loadSystemConfig]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <PenTool size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    AI 组件生成器
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                    一键生成前端组件
                  </p>
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <a
                href="/"
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                生成器
              </a>
              <a
                href="/config"
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                模型配置
              </a>
              <a
                href="/models"
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                模型管理
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <Tooltip content={getDarkModeTooltip()}>
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all"
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

      <footer className="py-6 text-center text-gray-400 dark:text-gray-500 text-sm border-t border-gray-200 dark:border-slate-800/50 max-w-[1800px] mx-auto">
        <div className="flex items-center justify-center gap-2">
          <span>纯前端可视化</span>
          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span>支持本地/在线API模型</span>
          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span>配置自动保存</span>
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
      { path: 'config', element: <ConfigPage /> },
      { path: 'models', element: <ModelManagementPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
