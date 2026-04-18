
import React from 'react';
import { Button } from '../../components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Switch } from '@radix-ui/react-switch';
import type { ModelConfig } from '../../types';

interface ModelDialogProps {
  open: boolean;
  isEditing: boolean;
  currentModel: Partial<ModelConfig>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onCurrentModelChange: (model: Partial<ModelConfig>) => void;
}

export const ModelDialog: React.FC<ModelDialogProps> = ({
  open,
  isEditing,
  currentModel,
  onOpenChange,
  onSave,
  onCurrentModelChange,
}) => {
  const updateField = (field: keyof ModelConfig, value: any) => {
    onCurrentModelChange({
      ...currentModel,
      [field]: value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* 渐变头部 */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10"></div>
          <div className="relative px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {isEditing ? "✏️ 编辑模型" : "✨ 添加新模型"}
            </DialogTitle>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* 模型名称 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              📝 模型名称
            </Label>
            <Input
              id="name"
              placeholder="给模型起个名字，比如 豆包4.0"
              value={currentModel.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">用于在列表中显示</p>
          </div>

          {/* 模型ID */}
          <div className="space-y-2">
            <Label htmlFor="modelName" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
               模型ID
            </Label>
            <Input
              id="modelName"
              placeholder="doubao-4k-character-level"
              value={currentModel.modelName || ""}
              onChange={(e) => updateField("modelName", e.target.value)}
              className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">API 实际调用使用的模型ID</p>
          </div>

          {/* 模式 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              🔧 模式
            </Label>
            <div className="flex gap-3">
              <button
                className={`flex-1 px-4 py-2.5 rounded-lg border-2 transition-all font-medium ${
                  currentModel.mode === "local" || !currentModel.mode
                    ? "border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:border-blue-300"
                }`}
                onClick={() => updateField("mode", "local")}
              >
                💻 本地
              </button>
              <button
                className={`flex-1 px-4 py-2.5 rounded-lg border-2 transition-all font-medium ${
                  currentModel.mode === "api"
                    ? "border-purple-500 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                    : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:border-purple-300"
                }`}
                onClick={() => updateField("mode", "api")}
              >
                ☁️ API
              </button>
            </div>
          </div>

          {/* API Key */}
          {currentModel.mode === "api" && (
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                🔑 API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxx"
                value={currentModel.apiKey || ""}
                onChange={(e) => updateField("apiKey", e.target.value)}
                className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          {/* API 地址 */}
          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              🌐 API 地址
            </Label>
            <Input
              id="baseUrl"
              placeholder="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
              value={currentModel.baseUrl || ""}
              onChange={(e) => updateField("baseUrl", e.target.value)}
              className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* 最大 Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              📈 最大 Tokens
            </Label>
            <Input
              id="maxTokens"
              type="number"
              placeholder="4096"
              value={currentModel.maxTokens || ""}
              onChange={(e) =>
                updateField("maxTokens", parseInt(e.target.value))
              }
              className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* 温度 */}
          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              🔥 温度
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              placeholder="0.7"
              value={currentModel.temperature || ""}
              onChange={(e) =>
                updateField("temperature", parseFloat(e.target.value))
              }
              className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* 启用状态 */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              ⚡ 启用状态
            </Label>
            <div className="flex items-center gap-3">
              <Switch
                id="enabled"
                checked={currentModel.enabled !== false}
                onCheckedChange={(checked) => updateField("enabled", checked)}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-600 w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <span
                  className={`data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1 block w-4 h-4 bg-white rounded-full transition-transform shadow-sm`}
                  data-state={currentModel.enabled !== false ? 'checked' : 'unchecked'}
                />
              </Switch>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {currentModel.enabled !== false ? "✓ 启用" : "✗ 禁用"}
              </span>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
            className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
          >
            取消
          </Button>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg opacity-75 blur group-hover:opacity-100 transition duration-1000 animate-gradient-xy"></div>
            <Button 
              variant="primary" 
              onClick={onSave}
              className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
            >
              {isEditing ? "💾 保存修改" : "✨ 添加模型"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
