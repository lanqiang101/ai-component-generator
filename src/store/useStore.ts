
import { create } from 'zustand';
import type { AppState, PreviewResolution, RefinedRequirements } from '../types';
import { defaultComponentParams } from '../types/defaults';

// ====== 辅助函数 (在 store 外部定义) ======

/**
 * 生成复杂组件 (多文件)
 */
async function generateComplexComponent(params: any, refinedRequirements: any): Promise<boolean> {
  const { setGeneration, startMultiFileGeneration } = useStore.getState();
  
  console.log('🟣 开始生成复杂组件 (多文件模式)');
  
  try {
    // 启动多文件生成任务
    const taskId = await startMultiFileGeneration({
      ...params,
      description: refinedRequirements?.refinedDescription || params.description,
      refinedRequirements: refinedRequirements ? {
        componentStructure: refinedRequirements.componentStructure,
        features: refinedRequirements.features,
        prototypeDiagram: refinedRequirements.prototypeDiagram,
        technicalNotes: refinedRequirements.technicalNotes,
      } : undefined,
    });
    
    console.log(`✅ 多文件生成任务已启动: ${taskId}`);
    
    // 注意: 多文件生成是异步的,进度通过轮询更新
    // 这里返回 true 表示任务已成功启动
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '多文件生成启动失败';
    setGeneration({ isGenerating: false, error: errorMessage });
    return false;
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
    const { params, refinedRequirements, setGeneration } = get();
    
    try {
      // 关闭弹窗
      set({ showRefinementDialog: false });
      setGeneration({ isGenerating: true, error: null });
      
      console.log('🚀 开始生成组件 (多文件模式)');
      
      // 统一使用多文件生成流程
      return await generateComplexComponent(params, refinedRequirements);
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
  
  // ====== 多文件组件化生成相关方法 ======
  
  // 初始化多文件生成状态
  generationTaskId: null,
  generationTask: null,
  generatedFiles: [],
  activeFilePath: '',
  generationProgress: 0,
  
  // 启动多文件生成任务
  startMultiFileGeneration: async (params) => {
    try {
      const response = await fetch('/api/generate/component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params }),
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      set({
        generationTaskId: result.taskId,
        generatedFiles: [],
        activeFilePath: '',
        generationProgress: 0,
      });
      
      // 开始轮询进度
      get().pollGenerationProgress();
      
      return result.taskId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '启动生成任务失败';
      console.error('启动多文件生成失败:', errorMessage);
      throw err;
    }
  },
  
  // 轮询生成进度
  pollGenerationProgress: () => {
    const { generationTaskId } = get();
    if (!generationTaskId) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/${generationTaskId}/status`);
        const result = await response.json();
        
        if (!result.success) {
          clearInterval(pollInterval);
          return;
        }
        
        const task = result.task;
        
        set({
          generationTask: task,
          generationProgress: task.progress,
        });
        
        // 如果任务完成,获取文件列表
        if (task.status === 'completed') {
          clearInterval(pollInterval);
          await get().loadGeneratedFiles(generationTaskId);
          // 设置生成状态为false
          set({ generation: { ...get().generation, isGenerating: false } });
        } else if (task.status === 'failed') {
          clearInterval(pollInterval);
          console.error('生成任务失败:', task.error);
          // 设置生成状态为false并记录错误
          set({ 
            generation: { ...get().generation, isGenerating: false, error: task.error || '生成失败' }
          });
        }
      } catch (err) {
        console.error('轮询进度失败:', err);
        clearInterval(pollInterval);
      }
    }, 1000); // 每秒轮询一次
    
    // 5分钟后自动停止轮询
    setTimeout(() => clearInterval(pollInterval), 300000);
  },
  
  // 加载生成的文件列表
  loadGeneratedFiles: async (taskId: string) => {
    try {
      const response = await fetch(`/api/generate/${taskId}/files`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const files = result.files;
      
      set({
        generatedFiles: files,
        activeFilePath: files.length > 0 ? files[0].path : '',
      });
    } catch (err) {
      console.error('加载文件列表失败:', err);
    }
  },
  
  // 设置当前激活的文件
  setActiveFile: (path: string) => {
    set({ activeFilePath: path });
  },
  
  // 获取合并后的代码(用于预览)
  getMergedCode: () => {
    const { generatedFiles } = get();
    
    if (generatedFiles.length === 0) {
      return '';
    }
    
    // 如果是单文件模式,直接返回
    if (generatedFiles.length === 1) {
      return generatedFiles[0].code;
    }
    
    // 多文件模式:虚拟合并
    let mergedCode = 'import React from \'react\';\n\n';
    
    // 收集所有子组件和工具函数
    const subComponents = generatedFiles
      .filter(f => f.path !== 'index.tsx')
      .map(file => {
        // 移除 export default,改为普通声明
        const cleanedCode = file.code.replace(/export default\s+/, '');
        return `// ====== From ${file.path} ======\n${cleanedCode}\n`;
      })
      .join('\n');
    
    mergedCode += subComponents;
    
    // 主组件代码
    const mainComponent = generatedFiles.find(f => f.path === 'index.tsx');
    if (mainComponent) {
      // 移除 import 语句
      const mainWithoutImports = mainComponent.code.replace(/import\s+.*?from\s+['"].*?['"];/g, '');
      mergedCode += `\n${mainWithoutImports}`;
    }
    
    return mergedCode.trim();
  },
  
  // 取消多文件生成
  cancelMultiFileGeneration: () => {
    set({
      generationTaskId: null,
      generationTask: null,
      generatedFiles: [],
      activeFilePath: '',
      generationProgress: 0,
    });
  },

}));
