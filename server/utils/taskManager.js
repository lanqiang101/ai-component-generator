/**
 * Task Manager Utility
 * Manages generation tasks in memory
 */

// In-memory task storage (use Redis/database in production)
export const generationTasks = new Map();

/**
 * Create a new generation task
 * @param {object} params - Component parameters
 * @param {object} architecture - Component architecture
 * @returns {object} Task object
 */
export function createTask(params, architecture) {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const task = {
    id: taskId,
    status: 'analyzing',
    currentStep: 0,
    totalSteps: architecture.totalFiles,
    progress: 0,
    params,
    architecture,
    files: [],
    startedAt: new Date(),
  };
  
  generationTasks.set(taskId, task);
  return task;
}

/**
 * Get task by ID
 * @param {string} taskId - Task ID
 * @returns {object|undefined} Task object
 */
export function getTask(taskId) {
  return generationTasks.get(taskId);
}

/**
 * Update task progress
 * @param {string} taskId - Task ID
 * @param {string} stepStatus - Step status
 * @param {string} fileName - File name
 */
export function updateTaskProgress(taskId, stepStatus, fileName) {
  const task = generationTasks.get(taskId);
  if (!task) return;
  
  task.currentStep++;
  task.progress = Math.round((task.currentStep / task.totalSteps) * 100);
  
  console.log(`  📝 [${task.currentStep}/${task.totalSteps}] ${stepStatus}: ${fileName}`);
}

/**
 * Save file to task
 * @param {string} taskId - Task ID
 * @param {object} fileData - File data
 */
export function saveTaskFile(taskId, fileData) {
  const task = generationTasks.get(taskId);
  if (!task) return;
  
  task.files.push(fileData);
}

/**
 * Mark task as completed
 * @param {string} taskId - Task ID
 */
export function completeTask(taskId) {
  const task = generationTasks.get(taskId);
  if (!task) return;
  
  task.status = 'completed';
  task.progress = 100;
  task.completedAt = new Date();
  
  console.log(`✅ Multi-file generation completed: ${task.files.length} files`);
}

/**
 * Mark task as failed
 * @param {string} taskId - Task ID
 * @param {string} error - Error message
 */
export function failTask(taskId, error) {
  const task = generationTasks.get(taskId);
  if (!task) return;
  
  task.status = 'failed';
  task.error = error;
  
  console.error(`❌ Generation task failed:`, error);
}

/**
 * Get task summary for response
 * @param {object} task - Task object
 * @returns {object} Task summary
 */
export function getTaskSummary(task) {
  return {
    id: task.id,
    status: task.status,
    progress: task.progress,
    currentStep: task.currentStep,
    totalSteps: task.totalSteps,
    error: task.error,
    files: task.files.map(f => ({
      path: f.path,
      name: f.name,
      status: f.status,
      size: f.code?.length || 0
    }))
  };
}
