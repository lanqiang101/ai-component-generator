/**
 * Code Generator Service
 * Handles multi-file component generation
 */

import { callAI } from './aiService.js';
import { cleanGeneratedCode } from '../utils/codeCleaner.js';
import { validateCodeCompleteness } from '../utils/codeValidator.js';
import { 
  updateTaskProgress, 
  saveTaskFile, 
  completeTask, 
  failTask,
  getTask 
} from '../utils/taskManager.js';
import {
  buildUtilityFunctionPrompt,
  buildSubComponentPrompt,
  buildMainComponentPrompt
} from '../prompts/componentPrompts.js';

/**
 * Execute multi-file generation
 * @param {string} taskId - Task ID
 */
export async function executeMultiFileGeneration(taskId) {
  const task = getTask(taskId);
  if (!task) return;
  
  console.log(`📦 Starting multi-file generation: ${taskId}`);
  
  const { architecture, params } = task;
  
  // ⚠️ Now only multi-file mode, removed single-file mode check
  
  // Multi-file mode: generate one by one
  task.status = 'generating';
  
  try {
    // 1. Generate utility functions (if any)
    if (architecture.utilityFunctions && architecture.utilityFunctions.length > 0) {
      for (const util of architecture.utilityFunctions) {
        updateTaskProgress(taskId, 'generating', util.filePath);
        
        const prompt = buildUtilityFunctionPrompt(util, params, task.files);
        let code = await callAI(null, prompt);
        code = cleanGeneratedCode(code);
        
        // Validate code completeness
        const validation = validateCodeCompleteness(code);
        
        saveTaskFile(taskId, {
          path: util.filePath,
          name: util.filePath.split('/').pop(),
          code: code,
          status: validation.valid ? 'completed' : 'warning',
          generatedAt: new Date(),
          validation: validation
        });
        
        if (!validation.valid) {
          console.warn(`⚠️ Utility function ${util.filePath} code incomplete:`, validation.issues.join(', '));
        }
        
        updateTaskProgress(taskId, 'completed', util.filePath);
      }
    }
    
    // 2. Generate sub-components
    if (architecture.subComponents && architecture.subComponents.length > 0) {
      // Sort by priority
      const sortedComponents = [...architecture.subComponents].sort((a, b) => a.priority - b.priority);
      
      for (const component of sortedComponents) {
        updateTaskProgress(taskId, 'generating', component.filePath);
        
        const prompt = buildSubComponentPrompt(component, params, task.files);
        let code = await callAI(null, prompt);
        code = cleanGeneratedCode(code);
        
        // Validate code completeness
        const validation = validateCodeCompleteness(code);
        
        saveTaskFile(taskId, {
          path: component.filePath,
          name: component.filePath.split('/').pop(),
          code: code,
          status: validation.valid ? 'completed' : 'warning',
          generatedAt: new Date(),
          validation: validation
        });
        
        if (!validation.valid) {
          console.warn(`⚠️ Sub-component ${component.filePath} code incomplete:`, validation.issues.join(', '));
        }
        
        updateTaskProgress(taskId, 'completed', component.filePath);
      }
    }
    
    // 3. Generate main component
    if (architecture.mainComponent) {
      updateTaskProgress(taskId, 'generating', architecture.mainComponent.filePath);
      
      const prompt = buildMainComponentPrompt(architecture, params, task.files);
      let code = await callAI(null, prompt);
      code = cleanGeneratedCode(code);
      
      // Validate code completeness
      const validation = validateCodeCompleteness(code);
      
      saveTaskFile(taskId, {
        path: architecture.mainComponent.filePath,
        name: 'index.tsx',
        code: code,
        status: validation.valid ? 'completed' : 'warning',
        generatedAt: new Date(),
        validation: validation
      });
      
      if (!validation.valid) {
        console.warn(`⚠️ Main component code incomplete:`, validation.issues.join(', '));
      }
      
      updateTaskProgress(taskId, 'completed', architecture.mainComponent.filePath);
    }
    
    completeTask(taskId);
  } catch (err) {
    failTask(taskId, err.message);
    throw err;
  }
}
