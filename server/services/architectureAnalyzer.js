/**
 * Architecture Analyzer Service
 * Analyzes component requirements and generates architecture design
 */

import { callAI } from './aiService.js';
import { buildArchitectureAnalysisPrompt } from '../prompts/componentPrompts.js';

/**
 * Analyze component architecture
 * @param {object} params - Component parameters
 * @returns {Promise<object>} Component architecture
 */
export async function analyzeComponentArchitecture(params) {
  try {
    const prompt = buildArchitectureAnalysisPrompt(params);
    const result = await callAI(null, prompt);
    
    // Parse JSON
    let jsonStr = result.trim();
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const architecture = JSON.parse(jsonStr);
    
    // ⚠️ Enforce multi-file generation mode
    architecture.generationMode = 'multi-file';
    
    // Ensure at least 2 files (main component + at least 1 sub-component)
    const subComponentsCount = architecture.subComponents?.length || 0;
    
    // If AI didn't return sub-components, generate a default one
    if (subComponentsCount === 0) {
      architecture.subComponents = [
        {
          id: 'comp1',
          name: `${params.componentName || 'Component'}Content`,
          filePath: `components/${params.componentName || 'Component'}Content.tsx`,
          purpose: 'Component main content area',
          props: [],
          estimatedLines: 80,
          priority: 1
        }
      ];
    }
    
    architecture.totalFiles = 1 + (architecture.subComponents?.length || 0); // Main + sub-components
    architecture.estimatedTotalLines = architecture.estimatedTotalLines || 150;
    
    console.log('✅ Architecture analysis completed:', {
      mode: architecture.generationMode,
      files: architecture.totalFiles,
      subComponents: architecture.subComponents.length,
      lines: architecture.estimatedTotalLines
    });
    
    return architecture;
  } catch (err) {
    console.error('⚠️ Architecture analysis failed, using default multi-file mode:', err.message);
    // Fallback to default multi-file mode
    return {
      componentName: params.componentName,
      description: params.description,
      generationMode: 'multi-file',
      totalFiles: 2,
      estimatedTotalLines: 150,
      subComponents: [
        {
          id: 'comp1',
          name: `${params.componentName || 'Component'}Content`,
          filePath: `components/${params.componentName || 'Component'}Content.tsx`,
          purpose: 'Component main content area',
          props: [],
          estimatedLines: 80,
          priority: 1
        }
      ],
      utilityFunctions: [],
      mainComponent: {
        filePath: 'index.tsx',
        dependencies: [`${params.componentName || 'Component'}Content`],
        estimatedLines: 70
      }
    };
  }
}
