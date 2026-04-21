
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
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-75 blur"></div>
            <div className="relative p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <Settings size={24} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              模型管理
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">管理所有可用的 AI 模型</p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* 添加模型按钮 */}
          <Button 
            variant="primary" 
            onClick={handleAdd}
            className="gap-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm"
          >
            <Plus size={14} className="mr-1" />
            <span>添加模型</span>
          </Button>
          
          {/* 返回配置按钮 */}
          <Button 
            variant="secondary" 
            onClick={() => navigate("/config")}
            className="gap-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm"
          >
            <ChevronLeft size={14} />
            <span>返回配置</span>
          </Button>
        </div>
      </div>

      {!loading && models.length === 0 && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl opacity-20 blur"></div>
          <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <p className="text-yellow-800 dark:text-yellow-200 text-center">
              🤖 当前没有任何模型，请点击右上角的"添加模型"按钮添加第一个模型。
            </p>
          </div>
        </div>
      )}

      {/* 模型列表 */}
      <div className="space-y-4">
        {models.map((model) => (
          <div key={model.id} className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 transition duration-300 blur"></div>
            <Card className="relative p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {model.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      model.enabled
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                    }`}>
                      {model.enabled ? '✓ 启用' : '✗ 禁用'}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                      {formatMode(model.mode)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">模型标识：</span>
                      <span className="font-medium text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">{model.modelName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">温度：</span>
                      <span className="font-medium text-gray-900 dark:text-white">{model.temperature}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">最大 Tokens：</span>
                      <span className="font-medium text-gray-900 dark:text-white">{model.maxTokens}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">API 地址：</span>
                      <span className="font-medium text-gray-900 dark:text-white truncate block max-w-[300px] font-mono text-xs">{model.baseUrl}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleEnabled(model)}
                    className="relative p-2.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all hover:scale-110"
                    title={model.enabled ? '禁用模型' : '启用模型'}
                  >
                    {model.enabled ? <PowerOff size={18} /> : <Power size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(model)}
                    className="relative p-2.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110"
                    title="编辑"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="relative p-2.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110"
                    title="删除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          </div>
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
