
import { create } from 'zustand';
import type { AppState, ModelConfig, PreviewResolution, SystemConfig, RefinedRequirements } from '../types';
import { defaultComponentParams } from '../types/defaults';

// 检查代码完整性
function checkCodeCompleteness(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  
  const trimmed = code.trim();
  if (!trimmed) return false;
  
  // 1. 检查是否包含结束标记
  if (trimmed.includes('[END_OF_CODE]')) {
    return true;
  }
  
  // 2. 检查最后一行是否完整
  const lastLine = trimmed.split('\n').pop()?.trim() || '';
  
  // 不完整的特征
  const incompletePatterns = [
    /\.\.\.$/,                    // 省略号结尾
    /=>\s*$/,                     // 箭头函数未完整
    /\(\s*$/,                     // 未闭合的左括号
    /\{\s*$/,                     // 未闭合的左大括号
    /<\s*$/,                      // 未闭合的尖括号
    /['"`]$/,                     // 未闭合的引号
    /,\s*$/,                      // 逗号结尾(可能是参数列表未完整)
    /\.\w*$/,                     // 属性访问未完整
  ];
  
  for (const pattern of incompletePatterns) {
    if (pattern.test(lastLine)) {
      console.warn('⚠️ 检测到代码不完整:', lastLine);
      return false;
    }
  }
  
  // 3. 检查括号平衡（简化版）
  let parenBalance = 0;
  let braceBalance = 0;
  let bracketBalance = 0;
  
  for (const char of trimmed) {
    if (char === '(') parenBalance++;
    else if (char === ')') parenBalance--;
    else if (char === '{') braceBalance++;
    else if (char === '}') braceBalance--;
    else if (char === '[') bracketBalance++;
    else if (char === ']') bracketBalance--;
  }
  
  // 如果括号不平衡，说明代码不完整
  if (parenBalance !== 0 || braceBalance !== 0 || bracketBalance !== 0) {
    console.warn('⚠️ 括号不平衡:', { parenBalance, braceBalance, bracketBalance });
    return false;
  }
  
  // 4. 检查是否有 export default（说明有完整的组件导出）
  if (!trimmed.includes('export default')) {
    console.warn('⚠️ 未找到 export default');
    return false;
  }
  
  return true;
}

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
      generation: { ...prev.generation, ...state },
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
    
    const maxRetries = 2; // 最大重试次数
    let retryCount = 0;
    let lastError = '';
    
    while (retryCount <= maxRetries) {
      try {
        // 关闭弹窗
        set({ showRefinementDialog: false });
        setGeneration({ isGenerating: true, error: null });
        
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
        
        console.log('📋 传递给生成接口的参数:', {
          componentName: enhancedParams.componentName,
          description: enhancedParams.description.substring(0, 100) + '...',
          hasRefinedRequirements: !!enhancedParams.refinedRequirements,
          features: enhancedParams.refinedRequirements?.features?.length || 0,
        });
        
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
        const isComplete = checkCodeCompleteness(cleanedCode);
        
        if (!isComplete && retryCount < maxRetries) {
          console.warn(`⚠️ 代码不完整（第 ${retryCount + 1} 次尝试），自动重试...`);
          retryCount++;
          lastError = '代码结构不完整，正在重新生成...';
          setGeneration({ error: lastError });
          continue; // 重试
        }
        
        if (!isComplete) {
          throw new Error('代码结构不完整，请重新生成');
        }
        
        setCurrentCode(cleanedCode);
        setGeneration({ isGenerating: false, error: null });
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '生成失败';
        
        if (retryCount < maxRetries) {
          console.warn(`⚠️ 生成失败（第 ${retryCount + 1} 次尝试），自动重试...`, errorMessage);
          retryCount++;
          lastError = `${errorMessage} (正在重试 ${retryCount}/${maxRetries})`;
          setGeneration({ error: lastError });
          continue; // 重试
        }
        
        setGeneration({ isGenerating: false, error: lastError || errorMessage });
        return false;
      }
    }
    
    return false;
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
