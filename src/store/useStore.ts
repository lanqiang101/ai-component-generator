
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
    const { systemConfig, params, models, setGeneration } = get();
    
    if (!systemConfig?.componentGenerationModelId) {
      setGeneration({
        isGenerating: false,
        error: '请先在模型配置中选择生成组件使用的AI模型',
      });
      return false;
    }

    try {
      set({ isRefiningRequirements: true });
      setGeneration({ error: null });
      
      // 找到选中的模型完整信息
      const model = models.find(m => m.id === systemConfig.componentGenerationModelId);
      if (!model) {
        throw new Error('选中的模型不存在，请重新选择');
      }
      
      // Call backend API for requirements refinement
      const response = await fetch('/api/refine-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, params }),
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
    const { systemConfig, params, models, refinedRequirements, setGeneration, setCurrentCode } = get();
    
    if (!systemConfig?.componentGenerationModelId) {
      setGeneration({
        isGenerating: false,
        error: '请先在模型配置中选择生成组件使用的AI模型',
      });
      return false;
    }

    try {
      // 关闭弹窗
      set({ showRefinementDialog: false });
      setGeneration({ isGenerating: true, error: null });
      
      // 找到选中的模型完整信息
      const model = models.find(m => m.id === systemConfig.componentGenerationModelId);
      if (!model) {
        throw new Error('选中的模型不存在，请重新选择');
      }
      
      // 使用整理后的需求生成组件
      const enhancedParams = {
        ...params,
        description: refinedRequirements?.refinedDescription || params.description,
      };
      
      // Call backend API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, params: enhancedParams }),
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setCurrentCode(result.data.code);
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
    const { systemConfig, params, models, setParams, setIsExpandingDescription, setGeneration } = get();
    
    if (!systemConfig?.componentGenerationModelId) {
      setGeneration({
        isGenerating: false,
        error: '请先在模型配置中选择生成组件使用的AI模型',
      });
      return false;
    }

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
      
      // 找到选中的模型完整信息
      const model = models.find(m => m.id === systemConfig.componentGenerationModelId);
      if (!model) {
        throw new Error('选中的模型不存在，请重新选择');
      }
      
      // Call backend API for description expansion
      const response = await fetch('/api/expand-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model, 
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
