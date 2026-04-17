
const Database = require('better-sqlite3');
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

// 初始化表
db.exec(`
  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    modelName TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('local', 'api')),
    apiKey TEXT,
    baseUrl TEXT NOT NULL,
    maxTokens INTEGER NOT NULL,
    temperature REAL NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    componentGenerationModelId INTEGER,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
);
`);

// 获取所有模型
function getAllModels() {
  return db.prepare('SELECT * FROM models ORDER BY id DESC').all();
}

// 获取启用的模型
function getEnabledModels() {
  return db.prepare('SELECT * FROM models WHERE enabled = 1 ORDER BY id DESC').all();
}

// 根据ID获取模型
function getModelById(id) {
  return db.prepare('SELECT * FROM models WHERE id = ?').get(id);
}

// 添加模型
function addModel(model) {
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO models (name, modelName, mode, apiKey, baseUrl, maxTokens, temperature, enabled, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    model.name,
    model.modelName,
    model.mode,
    model.apiKey || null,
    model.baseUrl,
    model.maxTokens,
    model.temperature,
    model.enabled ? 1 : 0,
    now,
    now
  );
  return result.lastInsertRowid;
}

// 更新模型
function updateModel(id, model) {
  const now = Date.now();
  const stmt = db.prepare(`
    UPDATE models
    SET name = ?, modelName = ?, mode = ?, apiKey = ?, baseUrl = ?, maxTokens = ?, temperature = ?, enabled = ?, updatedAt = ?
    WHERE id = ?
  `);
  stmt.run(
    model.name,
    model.modelName,
    model.mode,
    model.apiKey || null,
    model.baseUrl,
    model.maxTokens,
    model.temperature,
    model.enabled ? 1 : 0,
    now,
    id
  );
}

// 删除模型
function deleteModel(id) {
  db.prepare('DELETE FROM models WHERE id = ?').run(id);
}

// 获取系统配置
function getSystemConfig() {
  return db.prepare('SELECT * FROM system_config ORDER BY id DESC LIMIT 1').get();
}

// 保存系统配置
function saveSystemConfig(config) {
  const now = Date.now();
  const existing = getSystemConfig();
  
  if (existing) {
    db.prepare(`
      UPDATE system_config
      SET componentGenerationModelId = ?, updatedAt = ?
      WHERE id = ?
    `).run(config.componentGenerationModelId, now, existing.id);
  } else {
    db.prepare(`
      INSERT INTO system_config (componentGenerationModelId, createdAt, updatedAt)
      VALUES (?, ?, ?)
    `).run(config.componentGenerationModelId, now, now);
  }
}

module.exports = {
  getAllModels,
  getEnabledModels,
  getModelById,
  addModel,
  updateModel,
  deleteModel,
  getSystemConfig,
  saveSystemConfig,
};
