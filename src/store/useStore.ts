
import { create } from 'zustand';
import type { AppState, ModelConfig, ComponentGenerationParams, PreviewResolution, GenerationState, SystemConfig } from '../types';
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

  // Generate component
  generateComponent: async () => {
    const { systemConfig, params, models, setGeneration, setCurrentCode } = get();
    
    if (!systemConfig?.componentGenerationModelId) {
      setGeneration({
        isGenerating: false,
        error: '请先在模型配置中选择生成组件使用的AI模型',
      });
      return false;
    }

    try {
      setGeneration({ isGenerating: true, error: null });
      
      // 找到选中的模型完整信息
      const model = models.find(m => m.id === systemConfig.componentGenerationModelId);
      if (!model) {
        throw new Error('选中的模型不存在，请重新选择');
      }
      
      // Call backend API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, params }),
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
}));
