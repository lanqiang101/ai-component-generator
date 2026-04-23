import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Loader2, AlertCircle, CheckCircle2, Package, Code2, Sparkles, Layers } from 'lucide-react';

// Step configuration
const stepConfig: Record<string, { label: string; icon: any }> = {
  analyzing: {
    label: 'Analyzing Requirements',
    icon: Sparkles,
  },
  scaffolding: {
    label: 'Building Framework',
    icon: Package,
  },
  filling: {
    label: 'Generating Code',
    icon: Code2,
  },
  assembling: {
    label: 'Assembling Components',
    icon: Layers,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
  },
};

export const GenerationProgress: React.FC = () => {
  const { generation, generationTask, generationProgress } = useStore();

  // Calculate current step information
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

  // Generating
  if (generation.isGenerating && currentStepInfo) {
    const Icon = currentStepInfo.icon;
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-all duration-300">
        {/* Top: Status title and icon */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Loader2 size={20} className="text-blue-600 dark:text-blue-400 animate-spin" />
            <Icon size={12} className="text-blue-600 dark:text-blue-400 absolute -bottom-1 -right-1 bg-blue-50 dark:bg-blue-900/20 rounded-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                AI is {currentStepInfo.label}...
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
        
        {/* Progress bar */}
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${currentStepInfo.progress}%` }}
          >
            {/* Progress bar animation effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
        
        {/* Bottom: Step indicators */}
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
                {/* Step dot */}
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
                
                {/* Connector line */}
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

  // Generation failed
  if (generation.error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-all duration-300">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Generation Failed
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300">
              {generation.error}
            </p>
            <button
              onClick={() => useStore.getState().generateComponent()}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
            >
              Click to retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Get step description
function getStepDescription(step: string): string {
  const descriptions: Record<string, string> = {
    'Analyzing Requirements': 'Understanding component requirements and architecture design',
    'Building Framework': 'Creating file structure and dependencies',
    'Generating Code': 'Writing component implementation code',
    'Assembling Components': 'Integrating all files and exports',
  };
  return descriptions[step] || 'Please wait...';
}

// Get step key by index
function getStepKeyByIndex(index: number): string {
  const keys = ['analyzing', 'scaffolding', 'filling', 'assembling'];
  return keys[index] || 'analyzing';
}