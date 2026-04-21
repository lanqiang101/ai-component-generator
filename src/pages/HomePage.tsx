import React, { useEffect } from 'react';
import { LeftFormPanel } from '../components/LeftFormPanel';
import { PreviewPanel } from '../components/PreviewPanel';
import { CodeEditorPanel } from '../components/CodeEditorPanel';
import { GenerateButton } from '../components/GenerateButton';
import { GenerationProgress } from '../components/GenerationProgress';
import { RequirementsRefinementDialog } from '../components/RequirementsRefinementDialog';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';

export const HomePage: React.FC = () => {
  const { 
    currentCode, 
    generation, 
    previewResolution,
    // 多文件生成相关状态
    generationTaskId,
    generationTask,
    generatedFiles,
    activeFilePath,
    generationProgress,
    startMultiFileGeneration,
    setActiveFile,
    getMergedCode
  } = useStore();

  // Keyboard shortcut: Ctrl/Cmd + Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!generation.isGenerating) {
          useStore.getState().generateComponent();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generation.isGenerating]);

  // 测试函数: 启动简单组件生成
  const handleTestSimpleComponent = async () => {
    try {
      console.log('🧪 开始测试简单组件生成...');
      const taskId = await startMultiFileGeneration({
        componentName: 'TestButton',
        description: '一个简单的按钮组件,支持加载状态和点击反馈',
        framework: 'react-jsx',
        componentType: 'button',
        style: 'minimal',
        dimensions: '',
        needMockData: true,
        interactive: true,
        uiLibrary: 'none',
        uiLibraryVersion: '',
        stylePreprocessor: 'css',
        extraRequirements: ''
      });
      console.log('✅ 任务已启动:', taskId);
    } catch (err) {
      console.error('❌ 启动失败:', err);
    }
  };

  // 测试函数: 启动复杂组件生成
  const handleTestComplexComponent = async () => {
    try {
      console.log('🧪 开始测试复杂组件生成...');
      const taskId = await startMultiFileGeneration({
        componentName: 'ProductCard',
        description: '电商商品卡片组件,展示商品图片、价格、标题、描述、库存状态和购买按钮。需要拆分为多个子组件:图片组件、信息组件、操作组件',
        framework: 'react-jsx',
        componentType: 'card',
        style: 'minimal',
        dimensions: '',
        needMockData: true,
        interactive: true,
        uiLibrary: 'none',
        uiLibraryVersion: '',
        stylePreprocessor: 'css',
        extraRequirements: '请合理拆分组件,每个子组件职责单一'
      });
      console.log('✅ 任务已启动:', taskId);
    } catch (err) {
      console.error('❌ 启动失败:', err);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-100px)] min-h-0">
        {/* 左侧：表单 */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-5">
              <LeftFormPanel />
              
              {/* ====== Phase 1 测试区域 ====== */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🧪 Phase 1 测试工具
                </h4>
                
                <div className="space-y-2">
                  <button
                    onClick={handleTestSimpleComponent}
                    disabled={!!generationTaskId && generationProgress < 100}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {generationTaskId && generationProgress < 100
                      ? `生成中... ${Math.round(generationProgress)}%`
                      : '🔵 测试简单组件 (单文件)'}
                  </button>
                  
                  <button
                    onClick={handleTestComplexComponent}
                    disabled={!!generationTaskId && generationProgress < 100}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {generationTaskId && generationProgress < 100
                      ? `生成中... ${Math.round(generationProgress)}%`
                      : '🟣 测试复杂组件 (多文件)'}
                  </button>
                </div>

                {/* 状态显示 */}
                {generationTask && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                    <div><strong>任务ID:</strong> {generationTask.id?.slice(-8)}</div>
                    <div><strong>状态:</strong> 
                      <span className={`ml-1 px-2 py-0.5 rounded ${
                        generationTask.status === 'completed' ? 'bg-green-100 text-green-700' :
                        generationTask.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {generationTask.status}
                      </span>
                    </div>
                    <div><strong>进度:</strong> 
                      <div className="inline-block w-24 h-2 bg-gray-200 rounded-full ml-1 align-middle">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                      <span className="ml-1">{Math.round(generationProgress)}%</span>
                    </div>
                    <div><strong>文件数:</strong> {generatedFiles.length}</div>
                    
                    {/* 架构信息 */}
                    {generationTask.architecture && (
                      <div className="pt-2 mt-2 border-t border-gray-200 dark:border-slate-700">
                        <div><strong>复杂度:</strong> {generationTask.architecture.complexity}</div>
                        <div><strong>生成模式:</strong> {generationTask.architecture.generationMode}</div>
                        <div><strong>预估行数:</strong> {generationTask.architecture.estimatedTotalLines}</div>
                      </div>
                    )}
                    
                    {activeFilePath && (
                      <div className="pt-2 mt-2 border-t border-gray-200 dark:border-slate-700">
                        <strong>当前文件:</strong> {activeFilePath}
                      </div>
                    )}
                    
                    {generationTask.error && (
                      <div className="pt-2 mt-2 border-t border-red-200 text-red-600">
                        <strong>错误:</strong> {generationTask.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
              <GenerateButton />
            </div>
          </Card>
        </div>

        {/* 右侧：预览 + 代码 */}
        <div className="lg:col-span-8 flex flex-col min-h-0 gap-4">
          {/* 生成进度 */}
          <GenerationProgress />

          {/* 上方：预览 */}
          <div className="flex-1 min-h-[300px]">
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 bg-gray-50 dark:bg-slate-800/50">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">组件预览</h3>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-900">
                <PreviewPanel 
                  code={generatedFiles.length > 0 ? getMergedCode() : currentCode} 
                  resolution={previewResolution} 
                />
              </div>
            </Card>
          </div>

          {/* 下方：代码编辑器 */}
          <div className="flex-1 min-h-[250px]">
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  组件代码
                  {generatedFiles.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600">
                      ({activeFilePath})
                    </span>
                  )}
                </h3>
                
                {/* 文件切换按钮(仅多文件模式) */}
                {generatedFiles.length > 1 && (
                  <div className="flex gap-1">
                    {generatedFiles.map(file => (
                      <button
                        key={file.path}
                        onClick={() => setActiveFile(file.path)}
                        className={`px-2 py-1 rounded text-xs ${
                          activeFilePath === file.path
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {file.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditorPanel />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 需求整理弹窗 */}
      <RequirementsRefinementDialog />
    </>
  );
};