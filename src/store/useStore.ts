
import { create } from 'zustand';
import type { AppState, ModelConfig, PreviewResolution, SystemConfig, RefinedRequirements } from '../types';
import { defaultComponentParams } from '../types/defaults';

const STORAGE_KEYS = {
  models: 'aicg-models',
  systemConfig: 'aicg-system-config',
};

// Load from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
  }
  return defaultValue;
}

// Save to localStorage
function saveToStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export const useStore = create<AppState>((set, get) => ({
  // UI
  darkMode: 'auto',
  toggleDarkMode: () => {
    const { darkMode } = get();
    if (darkMode === 'auto') {
      set({ darkMode: true });
    } else if (darkMode === true) {
      set({ darkMode: false });
    } else {
      set({ darkMode: 'auto' });
    }
  },

  // Models & Config - loaded from localStorage
  models: loadFromStorage<ModelConfig[]>(STORAGE_KEYS.models, []),
  systemConfig: loadFromStorage<SystemConfig | null>(STORAGE_KEYS.systemConfig, null),

  loadModels: () => {
    const models = loadFromStorage<ModelConfig[]>(STORAGE_KEYS.models, []);
    set({ models });
  },

  loadSystemConfig: () => {
    const config = loadFromStorage<SystemConfig | null>(STORAGE_KEYS.systemConfig, null);
    set({ systemConfig: config });
  },

  saveModels: () => {
    const { models } = get();
    saveToStorage(STORAGE_KEYS.models, models);
  },

  saveSystemConfig: () => {
    const { systemConfig } = get();
    saveToStorage(STORAGE_KEYS.systemConfig, systemConfig);
  },

  // Generation parameters
  params: { ...defaultComponentParams },
  setParams: (newParams) => {
    set((state) => ({
      params: { ...state.params, ...newParams },
    }));
    // 如果切换了框架，自动重置UI库为默认none
    if ('framework' in newParams) {
      set((state) => ({
        params: { ...state.params, uiLibrary: 'none' },
      }));
    }
  },
  resetParams: () => {
    set({ params: { ...defaultComponentParams } });
  },

  // Current result
  currentCode: '',
  setCurrentCode: (code) => set({ currentCode: code }),

  // Preview resolution
  previewResolution: 'full' as PreviewResolution,
  setPreviewResolution: (res) => set({ previewResolution: res }),

  // Generation state
  generation: {
    isGenerating: false,
    error: null,
  },
  setGeneration: (state) => {
    set((prev) => ({
      generation: { ...prev.generation, ...state } as typeof prev.generation,
    }));
  },

  // Description expansion state
  isExpandingDescription: false,
  setIsExpandingDescription: (isExpanding: boolean) => set({ isExpandingDescription: isExpanding }),

  // Requirements refinement state
  isRefiningRequirements: false,
  refinedRequirements: null,
  showRefinementDialog: false,
  setShowRefinementDialog: (show: boolean) => set({ showRefinementDialog: show }),
  setRefinedRequirements: (requirements: RefinedRequirements | null) => set({ refinedRequirements: requirements }),

  // Generate component - 修改为先弹出需求整理弹窗
  generateComponent: async () => {
    const { params } = get();
    
    // 验证必填字段
    if (!params.componentName || !params.description) {
      const { setGeneration } = get();
      setGeneration({
        isGenerating: false,
        error: '请填写组件名称和描述',
      });
      return false;
    }

    // 先显示弹窗，再开始需求整理
    set({ showRefinementDialog: true });
    
    // 进行需求整理
    const success = await get().refineRequirements();
    return success;
  },

  // Refine requirements with AI
  refineRequirements: async () => {
    const { params, setGeneration } = get();
    
    try {
      set({ isRefiningRequirements: true });
      setGeneration({ error: null });
      
      // Call backend API for requirements refinement
      const response = await fetch('/api/refine-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params }),
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // 保存整理后的需求
      set({ refinedRequirements: result.data.refinedRequirements });
      set({ isRefiningRequirements: false });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '需求整理失败';
      setGeneration({ isGenerating: false, error: errorMessage });
      set({ isRefiningRequirements: false });
      return false;
    }
  },

  // Confirm and generate component
  confirmAndGenerate: async () => {
    const { params, refinedRequirements, setGeneration, setCurrentCode } = get();
    
    // 代码完整性检测函数
    const checkCodeCompleteness = (code: string): { complete: boolean; truncated: boolean; reason?: string } => {
      if (!code || typeof code !== 'string') {
        return { complete: false, truncated: true, reason: '代码为空' };
      }
      
      const trimmed = code.trim();
      
      // 1. 检查结束标记
      if (trimmed.endsWith('// [END_OF_CODE]')) {
        return { complete: true, truncated: false };
      }
      
      // 2. 检查最后一行是否完整
      const lines = trimmed.split('\n');
      const lastLine = lines[lines.length - 1].trim();
      
      // 不完整的特征模式
      const incompletePatterns = [
        /,\s*$/,           // 以逗号结尾
        /\.\.\.\s*$/,      // 以省略号结尾
        /\.\s*$/,          // 以点号结尾（属性访问未完成）
        /=>\s*$/,          // 以箭头函数符号结尾
        /=\s*$/,           // 以赋值符号结尾
        /\(\s*$/,          // 以开括号结尾
        /\{\s*$/,          // 以开大括号结尾
        /<[^>]*$/,         // 未闭合的 JSX 标签
        /['"`][^'"`]*$/,   // 未闭合的字符串
      ];
      
      for (const pattern of incompletePatterns) {
        if (pattern.test(lastLine)) {
          return { 
            complete: false, 
            truncated: true, 
            reason: `最后一行不完整: "${lastLine.substring(0, 50)}..."`
          };
        }
      }
      
      // 3. 检查是否有 export default
      if (!trimmed.includes('export default')) {
        return { 
          complete: false, 
          truncated: true, 
          reason: '缺少 export default 语句' 
        };
      }
      
      return { complete: true, truncated: false };
    };
    
    // 智能补全函数：尝试修复不完整的代码
    const autoCompleteCode = (code: string): string => {
      let fixedCode = code.trim();
      
      // 如果已经有结束标记，直接返回
      if (fixedCode.endsWith('// [END_OF_CODE]')) {
        return fixedCode;
      }
      
      console.log('🔧 尝试智能补全代码...');
      
      // 1. 检查并补全括号
      const openParens = (fixedCode.match(/\(/g) || []).length;
      const closeParens = (fixedCode.match(/\)/g) || []).length;
      const openBraces = (fixedCode.match(/\{/g) || []).length;
      const closeBraces = (fixedCode.match(/\}/g) || []).length;
      
      // 补全大括号
      if (openBraces > closeBraces) {
        const missing = openBraces - closeBraces;
        console.log(`  - 补全 ${missing} 个大括号`);
        fixedCode += '\n' + '}'.repeat(missing);
      }
      
      // 补全圆括号
      if (openParens > closeParens) {
        const missing = openParens - closeParens;
        console.log(`  - 补全 ${missing} 个圆括号`);
        fixedCode += ')'.repeat(missing);
      }
      
      // 2. 检查并补全 JSX 标签
      const openTags = (fixedCode.match(/<[A-Z][a-zA-Z]*(?![^>]*\/>)(?![^>]*\/)\s*>/g) || []).length;
      const closeTags = (fixedCode.match(/<\/[A-Z][a-zA-Z]*>/g) || []).length;
      
      if (openTags > closeTags) {
        const missing = openTags - closeTags;
        console.log(`  - 警告: 可能存在 ${missing} 个未闭合的 JSX 标签`);
        // JSX 标签很难自动补全，这里只记录警告
      }
      
      // 3. 确保有 export default
      if (!fixedCode.includes('export default')) {
        console.log('  - 警告: 缺少 export default');
      }
      
      // 4. 添加结束标记
      fixedCode += '\n\n// [END_OF_CODE]';
      
      return fixedCode;
    };
    
    try {
      // 关闭弹窗
      set({ showRefinementDialog: false });
      setGeneration({ isGenerating: true, error: null });
      
      let finalCode = '';
      let attemptCount = 0;
      const maxAttempts = 3; // 最多重试 3 次
      
      while (attemptCount < maxAttempts) {
        attemptCount++;
        
        // 构建增强的参数，包含完整的需求分析
        const enhancedParams = {
          ...params,
          description: refinedRequirements?.refinedDescription || params.description,
          // 传递完整的需求分析信息
          refinedRequirements: refinedRequirements ? {
            componentStructure: refinedRequirements.componentStructure,
            features: refinedRequirements.features,
            prototypeDiagram: refinedRequirements.prototypeDiagram,
            technicalNotes: refinedRequirements.technicalNotes,
          } : undefined,
        };
        
        console.log(`📋 第 ${attemptCount} 次生成尝试`);
        
        // Call backend API
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ params: enhancedParams }),
        });
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }
        
        // 清理生成的代码（Worker已处理Markdown，此处仅做兜底）
        let cleanedCode = result.data.code;
        if (cleanedCode) {
          cleanedCode = cleanedCode.trim();
          
          // 兜底：再次确保没有Markdown标记
          cleanedCode = cleanedCode.replace(/\\?`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\\?\n?/gi, '');
          cleanedCode = cleanedCode.replace(/^`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, '');
          cleanedCode = cleanedCode.replace(/\n?`{3}$/, '');
          cleanedCode = cleanedCode.trim();
        }
        
        // 检查代码完整性
        const completenessCheck = checkCodeCompleteness(cleanedCode);
        
        if (completenessCheck.complete) {
          // 代码完整，直接使用
          finalCode = cleanedCode;
          console.log('✅ 代码完整性检查通过');
          break;
        } else {
          // 代码不完整
          console.warn(`⚠️ 代码不完整 (${attemptCount}/${maxAttempts}):`, completenessCheck.reason);
          
          if (attemptCount < maxAttempts) {
            // 还有重试次数，显示重试提示
            setGeneration({ 
              isGenerating: true, 
              error: `代码结构不完整，正在重新生成... (${attemptCount}/${maxAttempts})` 
            });
            
            // 等待一小段时间再重试
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            // 达到最大重试次数，尝试智能补全
            console.log('🔧 达到最大重试次数，尝试智能补全...');
            finalCode = autoCompleteCode(cleanedCode);
          }
        }
      }
      
      setCurrentCode(finalCode);
      setGeneration({ isGenerating: false });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成失败';
      setGeneration({ isGenerating: false, error: errorMessage });
      return false;
    }
  },

  // Cancel refinement
  cancelRefinement: () => {
    set({ 
      showRefinementDialog: false, 
      refinedRequirements: null 
    });
  },

  // Expand description with AI
  expandDescription: async () => {
    const { params, setParams, setIsExpandingDescription, setGeneration } = get();
    
    if (!params.description || params.description.trim().length === 0) {
      setGeneration({
        isGenerating: false,
        error: '请先输入组件描述',
      });
      return false;
    }

    try {
      setIsExpandingDescription(true);
      setGeneration({ error: null });
      
      // Call backend API for description expansion
      const response = await fetch('/api/expand-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: params.description,
          componentName: params.componentName 
        }),
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update description with expanded text
      setParams({ description: result.data.expandedDescription });
      setIsExpandingDescription(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '扩写失败';
      setGeneration({ isGenerating: false, error: errorMessage });
      setIsExpandingDescription(false);
      return false;
    }
  },
}));
