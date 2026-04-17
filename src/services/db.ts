
import type { ModelConfig, SystemConfig } from '../types';

const API_BASE = '/api';

export async function getModels(): Promise<ModelConfig[]> {
  const response = await fetch(`${API_BASE}/models`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

export async function getEnabledModels(): Promise<ModelConfig[]> {
  const response = await fetch(`${API_BASE}/models/enabled`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

export async function addModel(model: Partial<ModelConfig>): Promise<number> {
  const response = await fetch(`${API_BASE}/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.id;
}

export async function updateModel(id: number, model: Partial<ModelConfig>): Promise<void> {
  const response = await fetch(`${API_BASE}/models/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }
}

export async function deleteModel(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/models/${id}`, {
    method: 'DELETE',
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }
}

export async function getSystemConfig(): Promise<SystemConfig | null> {
  const response = await fetch(`${API_BASE}/config`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

export async function saveSystemConfig(config: { componentGenerationModelId: number | null }): Promise<void> {
  const response = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }
}

export async function generateComponent(modelId: number, params: any): Promise<string> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId, params }),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data.code;
}
