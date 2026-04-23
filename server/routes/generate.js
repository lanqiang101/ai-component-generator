/**
 * Generation Routes
 * Handles component generation API endpoints
 */

import { callAI } from '../services/aiService.js';
import { cleanGeneratedCode } from '../utils/codeCleaner.js';
import { analyzeComponentArchitecture } from '../services/architectureAnalyzer.js';
import { executeMultiFileGeneration } from '../services/codeGenerator.js';
import { createTask, getTask, getTaskSummary } from '../utils/taskManager.js';

/**
 * Register generation routes
 * @param {object} app - Express app instance
 */
export function registerGenerationRoutes(app) {
  // ===== AI Component Generation API =====
  // Frontend gets model config, sends complete model params to backend, backend does API proxy
  
  app.post('/api/generate', async (req, res) => {
    try {
      const { params } = req.body;
      
      if (!params) {
        return res.status(400).json({ success: false, error: 'Missing parameters' });
      }
  
      // Call AI API, directly pass params object
      let result = await callAI(null, params);
      
      // Clean AI returned code using utility function
      result = cleanGeneratedCode(result);
      
      console.log('Cleaned code length:', result.length);
      console.log('First 100 chars of code:', result.substring(0, 100));
      
      res.json({ 
        success: true, 
        data: {
          code: result,
        } 
      });
    } catch (err) {
      console.error('Generation failed:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  
  // ====== Multi-File Component Generation API ======
  
  // POST /api/generate/component - Start multi-file generation task
  app.post('/api/generate/component', async (req, res) => {
    try {
      const { params } = req.body;
      
      if (!params) {
        return res.status(400).json({ success: false, error: 'Missing parameters' });
      }
      
      console.log('🚀 Starting multi-file generation task');
      
      // 1. Analyze component architecture
      const architecture = await analyzeComponentArchitecture(params);
      
      // 2. Create task
      const task = createTask(params, architecture);
      
      // 3. Async execution
      executeMultiFileGeneration(task.id).catch(err => {
        console.error('❌ Generation task failed:', err);
      });
      
      res.json({ 
        success: true, 
        taskId: task.id,
        message: 'Generation task started',
        architecture: {
          complexity: architecture.complexity,
          generationMode: architecture.generationMode,
          totalFiles: architecture.totalFiles,
          estimatedTotalLines: architecture.estimatedTotalLines
        }
      });
    } catch (err) {
      console.error('Failed to start generation task:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  
  // GET /api/generate/:taskId/status - Query task status
  app.get('/api/generate/:taskId/status', (req, res) => {
    const task = getTask(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    res.json({ 
      success: true, 
      task: getTaskSummary(task)
    });
  });
  
  // GET /api/generate/:taskId/files - Get all generated files
  app.get('/api/generate/:taskId/files', (req, res) => {
    const task = getTask(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    if (task.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        error: 'Task not completed or does not exist' 
      });
    }
    
    res.json({ 
      success: true, 
      files: task.files
    });
  });
}
