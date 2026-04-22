import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Loader2, AlertCircle, CheckCircle2, FileCode2, Package, Code2, Sparkles, Layers } from 'lucide-react';

// 步骤配置
const stepConfig: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  analyzing: {
    label: '分析需求',
    icon: Sparkles,
  },
  scaffolding: {
    label: '构建框架',
    icon: Package,
  },
  filling: {
    label: '生成代码',
    icon: Code2,
  },
  assembling: {
    label: '组装组件',
    icon: Layers,
  },
  completed: {
    label: '完成',
    icon: CheckCircle2,
  },
  failed: {
    label: '失败',
    icon: AlertCircle,
  },
};

export const GenerationProgress: React.FC = () => {
  const { generation, generationTask, generationProgress } = useStore();

  // 计算当前步骤信息
  const currentStepInfo = useMemo(() => {
    if (!generationTask) return null;
    
    const status = generationTask.status;
    const config = stepConfig[status] || stepConfig.analyzing;
    
    return {
      ...config,
      current: generationTask.currentStep + 1,
      total: generationTask.totalSteps,
      progress: generationProgress,
    };
  }, [generationTask, generationProgress]);

  // 生成中
  if (generation.isGenerating && currentStepInfo) {
    const Icon = currentStepInfo.icon;
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-all duration-300">
        {/* 顶部: 状态标题和图标 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Loader2 size={20} className="text-blue-600 dark:text-blue-400 animate-spin" />
            <Icon size={12} className="text-blue-600 dark:text-blue-400 absolute -bottom-1 -right-1 bg-blue-50 dark:bg-blue-900/20 rounded-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                AI 正在{currentStepInfo.label}...
              </h4>
              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                {currentStepInfo.current}/{currentStepInfo.total}
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              {getStepDescription(currentStepInfo.label)}
            </p>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${currentStepInfo.progress}%` }}
          >
            {/* 进度条动画效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
        
        {/* 底部: 步骤指示器 */}
        <div className="flex items-center gap-1 mt-3">
          {Array.from({ length: currentStepInfo.total }).map((_, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStepInfo.current;
            const isCurrent = stepNum === currentStepInfo.current;
            const stepKey = getStepKeyByIndex(index);
            const stepConfigItem = stepConfig[stepKey];
            const StepIcon = stepConfigItem?.icon;
            
            return (
              <div key={index} className="flex items-center flex-1">
                {/* 步骤圆点 */}
                <div 
                  className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-300
                    ${isCompleted 
                      ? 'bg-blue-600 text-white' 
                      : isCurrent 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} />
                  ) : StepIcon ? (
                    <StepIcon size={12} />
                  ) : (
                    stepNum
                  )}
                </div>
                
                {/* 连接线 */}
                {index < currentStepInfo.total - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 生成失败
  if (generation.error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-all duration-300">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              生成失败
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300">
              {generation.error}
            </p>
            <button
              onClick={() => useStore.getState().generateComponent()}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
            >
              点击重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// 获取步骤描述
function getStepDescription(step: string): string {
  const descriptions: Record<string, string> = {
    '分析需求': '理解组件需求和架构设计',
    '构建框架': '创建文件结构和依赖关系',
    '生成代码': '编写组件实现代码',
    '组装组件': '整合所有文件和导出',
  };
  return descriptions[step] || '请稍候...';
}

// 根据索引获取步骤 key
function getStepKeyByIndex(index: number): string {
  const keys = ['analyzing', 'scaffolding', 'filling', 'assembling'];
  return keys[index] || 'analyzing';
}