
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ChevronLeft, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { Card, CardContent } from '../components/ui/Card';
import type { ModelConfig } from '../types';

export const ConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { models, systemConfig, saveSystemConfig } = useStore();
  const [loading, setLoading] = useState(false);
  const [componentGenerationModelId, setComponentGenerationModelId] = useState<number | null>(null);

  // 页面加载时加载数据
  useEffect(() => {
    setLoading(true);
    useStore.getState().loadSystemConfig();
    useStore.getState().loadModels();
    if (useStore.getState().systemConfig?.componentGenerationModelId !== undefined) {
      setComponentGenerationModelId(
        useStore.getState().systemConfig?.componentGenerationModelId || null
      );
    }
    setLoading(false);
  }, []);

  // 保存配置
  const saveConfig = () => {
    const { systemConfig, saveSystemConfig } = useStore.getState();
    const now = Date.now();
    
    if (systemConfig) {
      systemConfig.componentGenerationModelId = componentGenerationModelId;
      systemConfig.updatedAt = now;
    } else {
      const newConfig: any = {
        id: 1,
        componentGenerationModelId,
        createdAt: now,
        updatedAt: now,
      };
      useStore.getState().systemConfig = newConfig;
    }
    
    saveSystemConfig();
    alert('配置已保存成功！');
  };

  // 根据ID获取模型信息
  const getModelById = (id: number | null | undefined) => {
    if (!id) return null;
    return models.find((m) => String(m.id) === String(id) && m.enabled);
  };

  const enabledModels = models.filter(m => m.enabled);

  return (
    <div className="container mx-auto px-0 max-w-4xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
            <Settings size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              系统配置
            </h1>
            <p className="text-sm text-gray-500">
              配置组件生成使用的模型
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/models")}>
            <SettingsIcon size={16} className="mr-1" />
            模型管理
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            <ChevronLeft size={16} />
            返回生成器
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-500 mr-2" />
          <span className="text-gray-500">加载配置...</span>
        </div>
      )}

      {!loading && enabledModels.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            当前没有任何启用的模型，请先前往 <strong>模型管理</strong> 页面添加模型。
          </p>
        </div>
      )}

      {/* 配置区域 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
              组件生成模型
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              选择用于生成前端组件的 AI 模型（仅显示已启用的模型）
            </p>
          </div>

          <div className="space-y-3">
            <Label>选择模型</Label>
            <select
              value={componentGenerationModelId != null ? componentGenerationModelId.toString() : ""}
              onChange={(e) => setComponentGenerationModelId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            >
              <option value="">请选择一个模型</option>
              {enabledModels.map((model) => (
                <option key={model.id} value={model.id.toString()}>
                  {model.name} ({model.modelName})
                </option>
              ))}
            </select>
          </div>

          {getModelById(componentGenerationModelId) && (
            <Card>
              <CardContent className="pt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    模型名称
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getModelById(componentGenerationModelId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    模型标识
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getModelById(componentGenerationModelId)?.modelName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    API 地址
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                    {getModelById(componentGenerationModelId)?.baseUrl}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    温度
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getModelById(componentGenerationModelId)?.temperature}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    最大 Tokens
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getModelById(componentGenerationModelId)?.maxTokens}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="mt-6 flex justify-end">
        <Button
          variant="primary"
          onClick={saveConfig}
          className="flex items-center gap-2 px-8"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          保存配置
        </Button>
      </div>

      {/* 使用提示 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          ⚙️ 配置说明
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• 选择一个已添加并启用的模型用于生成组件</li>
          <li>• 只显示已启用的模型，禁用模型不在这里展示</li>
          <li>• 修改后点击"保存配置"会保存在浏览器 localStorage</li>
          <li>• 添加/编辑/删除模型请到"模型管理"页面</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfigPage;
