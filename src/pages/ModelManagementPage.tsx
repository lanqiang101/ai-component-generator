
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ChevronLeft, Plus, Trash2, Edit, Power, PowerOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { ModelConfig } from '../types';
import { ModelDialog } from './ModelManagementPage/ModelDialog';
import { useStore } from '../store/useStore';

export const ModelManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { models, saveModels } = useStore();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModel, setCurrentModel] = useState<Partial<ModelConfig>>({});

  // 加载数据
  useEffect(() => {
    setLoading(true);
    useStore.getState().loadModels();
    setLoading(false);
  }, []);

  // 打开新增对话框
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentModel({
      name: '',
      modelName: '',
      mode: 'api',
      apiKey: '',
      baseUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    });
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (model: ModelConfig) => {
    setIsEditing(true);
    setCurrentModel({ ...model });
    setDialogOpen(true);
  };

  // 切换启用状态
  const handleToggleEnabled = (model: ModelConfig) => {
    const { models, saveModels } = useStore.getState();
    const updatedModels = models.map(m => 
      m.id === model.id ? { ...m, enabled: !m.enabled } : m
    );
    useStore.getState().models = updatedModels;
    saveModels();
  };

  // 保存模型
  const handleSave = () => {
    const { models, saveModels } = useStore.getState();
    
    if (!currentModel.name || !currentModel.modelName) {
      alert('模型名称和模型标识不能为空');
      return;
    }

    const now = Date.now();

    if (isEditing && currentModel.id !== undefined) {
      // 更新
      const updatedModels = models.map(m => 
        m.id === currentModel.id 
          ? { ...m, ...currentModel, updatedAt: now } 
          : m
      );
      useStore.getState().models = updatedModels;
    } else {
      // 添加新模型 - 生成新ID
      const newId = models.length > 0 
        ? Math.max(...models.map(m => m.id)) + 1 
        : 1;
      const newModel: ModelConfig = {
        id: newId,
        name: currentModel.name!,
        modelName: currentModel.modelName!,
        mode: currentModel.mode || 'api',
        apiKey: currentModel.apiKey,
        baseUrl: currentModel.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        maxTokens: currentModel.maxTokens || 4096,
        temperature: currentModel.temperature || 0.7,
        enabled: currentModel.enabled !== false,
        createdAt: now,
        updatedAt: now,
      };
      models.push(newModel);
    }

    saveModels();
    setDialogOpen(false);
  };

  // 删除模型
  const handleDelete = (id: number) => {
    if (!confirm('确定要删除这个模型吗？删除后无法恢复。')) return;
    const { models, saveModels } = useStore.getState();
    const updatedModels = models.filter(m => m.id !== id);
    useStore.getState().models = updatedModels;
    saveModels();
  };

  const formatMode = (mode: string) => {
    return mode === 'api' ? '在线 API' : '本地';
  };

  return (
    <div className="container mx-auto px-0 max-w-5xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
            <Settings size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              模型管理
            </h1>
            <p className="text-sm text-gray-500">管理所有可用的 AI 模型（存储在 localStorage）</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleAdd}>
            <Plus size={16} className="mr-1" />
            添加模型
          </Button>
          <Button variant="secondary" onClick={() => navigate("/config")}>
            <ChevronLeft size={16} />
            返回配置
          </Button>
        </div>
      </div>

      {!loading && models.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            当前没有任何模型，请点击"添加模型"按钮添加第一个模型。
          </p>
        </div>
      )}

      {/* 模型列表 */}
      <div className="space-y-4">
        {models.map((model) => (
          <Card key={model.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {model.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    model.enabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {model.enabled ? '启用' : '禁用'}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                    {formatMode(model.mode)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">模型标识：</span>
                    <span className="font-medium text-gray-900 dark:text-white">{model.modelName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">温度：</span>
                    <span className="font-medium text-gray-900 dark:text-white">{model.temperature}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">最大 Tokens：</span>
                    <span className="font-medium text-gray-900 dark:text-white">{model.maxTokens}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">API 地址：</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate block max-w-[300px]">
                      {model.baseUrl}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggleEnabled(model)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title={model.enabled ? '禁用模型' : '启用模型'}
                >
                  {model.enabled ? <PowerOff size={18} /> : <Power size={18} />}
                </button>
                <button
                  onClick={() => handleEdit(model)}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 对话框 */}
      <ModelDialog
        open={dialogOpen}
        isEditing={isEditing}
        currentModel={currentModel}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onCurrentModelChange={setCurrentModel}
      />

      {/* 使用提示 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          💡 使用说明
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• 所有模型统一在这里管理，增删改查都在这里完成</li>
          <li>• 禁用的模型不会出现在系统配置的下拉选择列表中</li>
          <li>• 在系统配置页面选择组件生成使用哪个模型</li>
          <li>• 支持本地模型（如 Ollama）和在线 API 模型</li>
          <li>• 配置保存在浏览器 localStorage，刷新页面不会丢失</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelManagementPage;
