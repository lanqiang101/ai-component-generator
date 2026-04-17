
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
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? "编辑模型" : "添加新模型"}
          </DialogTitle>
        </div>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">模型名称</Label>
            <Input
              id="name"
              placeholder="给模型起个名字，比如 豆包4.0"
              value={currentModel.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
            />
            <p className="text-xs text-gray-500">用于在列表中显示</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelName">模型ID</Label>
            <Input
              id="modelName"
              placeholder="doubao-4k-character-level"
              value={currentModel.modelName || ""}
              onChange={(e) => updateField("modelName", e.target.value)}
            />
            <p className="text-xs text-gray-500">API 实际调用使用的模型ID</p>
          </div>

          <div className="space-y-2">
            <Label>模式</Label>
            <div className="flex gap-3">
              <button
                className={`px-3 py-2 rounded-lg border transition-all ${
                  currentModel.mode === "local" || !currentModel.mode
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 dark:border-slate-600"
                }`}
                onClick={() => updateField("mode", "local")}
              >
                本地
              </button>
              <button
                className={`px-3 py-2 rounded-lg border transition-all ${
                  currentModel.mode === "api"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 dark:border-slate-600"
                }`}
                onClick={() => updateField("mode", "api")}
              >
                API
              </button>
            </div>
          </div>

          {currentModel.mode === "api" && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxx"
                value={currentModel.apiKey || ""}
                onChange={(e) => updateField("apiKey", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="baseUrl">API 地址</Label>
            <Input
              id="baseUrl"
              placeholder="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
              value={currentModel.baseUrl || ""}
              onChange={(e) => updateField("baseUrl", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxTokens">最大 Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                placeholder="4096"
                value={currentModel.maxTokens || ""}
                onChange={(e) =>
                  updateField("maxTokens", parseInt(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">温度</Label>
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
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">启用状态</Label>
            <div className="flex items-center gap-3">
              <Switch
                id="enabled"
                checked={currentModel.enabled !== false}
                onCheckedChange={(checked) => updateField("enabled", checked)}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentModel.enabled !== false ? "当前：启用" : "当前：禁用"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={onSave}>
            {isEditing ? "保存修改" : "添加模型"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
