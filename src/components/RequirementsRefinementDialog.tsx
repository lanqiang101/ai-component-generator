import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Check, AlertCircle, BookOpen, ChevronRight } from 'lucide-react';
import mermaid from 'mermaid';
import { useStore } from '../store/useStore';
import type { ComponentGenerationParams } from '../types';

// 初始化 Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

// 安全解析 JSON 数组的辅助函数
const safeParseJSONArray = (value: string | unknown): string[] => {
  if (!value) return [];
  
  // 如果已经是数组，直接返回
  if (Array.isArray(value)) return value;
  
  // 尝试解析 JSON
  try {
    const parsed = JSON.parse(value as string);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.warn('JSON 解析失败，降级为普通文本:', value);
  }
  
  // 降级处理：如果是字符串，按换行或逗号分割
  if (typeof value === 'string') {
    return value.split(/[\n,，]/).map(item => item.trim()).filter(Boolean);
  }
  
  return [];
};

// 常见组件模板库
const COMPONENT_TEMPLATES: Array<{
  id: string;
  name: string;
  icon: string;
  description: string;
  template: Partial<ComponentGenerationParams>;
}> = [
  {
    id: 'product-card',
    name: '商品卡片',
    icon: '🛍️',
    description: '电商商品展示卡片，包含图片、价格、标题等',
    template: {
      componentName: 'ProductCard',
      description: '一个电商商品展示卡片组件，用于在商品列表页面中展示单个商品的核心信息。组件应包含商品主图、标题、价格、促销标签等元素，支持悬停效果和点击跳转。采用简约现代风格，自适应容器宽度。',
      componentType: 'card',
      style: 'minimal',
      needMockData: true,
      interactive: true,
    },
  },
  {
    id: 'navbar',
    name: '导航栏',
    icon: '🧭',
    description: '顶部导航栏，包含 Logo、菜单、搜索框',
    template: {
      componentName: 'NavigationBar',
      description: '响应式顶部导航栏组件，包含品牌 Logo、主导航菜单、搜索框和用户操作区域。支持移动端折叠菜单，具有平滑过渡动画和滚动时的背景变化效果。',
      componentType: 'navbar',
      style: 'minimal',
      needMockData: true,
      interactive: true,
    },
  },
  {
    id: 'data-table',
    name: '数据表格',
    icon: '📊',
    description: '可排序、分页的数据表格组件',
    template: {
      componentName: 'DataTable',
      description: '功能完整的数据表格组件，支持列排序、分页、行选择、批量操作等功能。表头固定，内容区域可滚动。提供搜索过滤和导出功能。采用现代化的设计风格，支持深色模式。',
      componentType: 'table',
      style: 'material',
      needMockData: true,
      interactive: true,
    },
  },
  {
    id: 'login-form',
    name: '登录表单',
    icon: '🔐',
    description: '用户登录表单，包含邮箱、密码输入和验证',
    template: {
      componentName: 'LoginForm',
      description: '用户登录表单组件，包含邮箱/手机号输入框、密码输入框（带显示/隐藏切换）、记住我选项和忘记密码链接。具有实时表单验证、错误提示和加载状态。支持键盘导航和无障碍访问。',
      componentType: 'form',
      style: 'minimal',
      needMockData: false,
      interactive: true,
    },
  },
  {
    id: 'image-gallery',
    name: '图片画廊',
    icon: '🖼️',
    description: '图片展示画廊，支持缩略图和灯箱效果',
    template: {
      componentName: 'ImageGallery',
      description: '响应式图片画廊组件，以网格布局展示多张图片。支持懒加载、点击图片放大查看（灯箱效果）、左右滑动切换、缩略图导航。具有优雅的加载动画和过渡效果。',
      componentType: 'other',
      style: 'glassmorphism',
      needMockData: true,
      interactive: true,
    },
  },
  {
    id: 'timeline',
    name: '时间轴',
    icon: '⏱️',
    description: '垂直时间轴，展示事件发展历程',
    template: {
      componentName: 'Timeline',
      description: '垂直时间轴组件，用于展示项目进展、历史记录或事件流程。每个时间节点包含日期、标题、描述和可选的图标。支持交替布局和单侧布局，具有滚动进入动画效果。',
      componentType: 'other',
      style: 'minimal',
      needMockData: true,
      interactive: false,
    },
  },
];

// Mermaid 图表渲染组件
const MermaidDiagram: React.FC<{ chart: string; title?: string }> = ({ chart, title }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isNotMermaid, setIsNotMermaid] = useState(false);

  // 清理和转义 Mermaid 节点文本中的特殊字符
  const sanitizeMermaidSyntax = (mermaidCode: string): string => {
    let sanitized = mermaidCode;
    
    // 检测是否为 block-beta 语法
    const isBlockBeta = /^\s*block-beta/i.test(sanitized.trim());
    
    if (isBlockBeta) {
      // block-beta 语法的特殊处理
      // 匹配模式: NodeId["Label"] 或 NodeId[Label]
      sanitized = sanitized.replace(
        /(\w+)\[(.*?)\]/g,
        (_match, nodeId, label) => {
          // 统一用双引号包裹,并转义内部的双引号和括号
          const escapedLabel = label
            .replace(/"/g, '&quot;')
            .replace(/\(/g, '&#40;')
            .replace(/\)/g, '&#41;')
            .replace(/\[/g, '&#91;')
            .replace(/\]/g, '&#93;');
          return `${nodeId}["${escapedLabel}"]`;
        }
      );
      
      // 处理无引号的简单形式: NodeId Label (block-beta 特有语法)
      // 这种格式在 block-beta 中表示节点,需要转换为带引号的形式
      sanitized = sanitized.replace(
        /^(\s*)(\w+)\s+([^[\]\n"]+)$/gm,
        (match, indent, nodeId, label) => {
          // 排除关键字如 columns, space, block, end 等
          const keywords = ['columns', 'space', 'block', 'end', 'stack'];
          if (!keywords.includes(nodeId.toLowerCase())) {
            const escapedLabel = label.trim()
              .replace(/"/g, '&quot;')
              .replace(/\(/g, '&#40;')
              .replace(/\)/g, '&#41;');
            return `${indent}${nodeId}["${escapedLabel}"]`;
          }
          return match;
        }
      );
    } else {
      // graph/flowchart 语法的处理
      // 处理方括号形式的节点: NodeId[Label with special chars]
      sanitized = sanitized.replace(
        /(\w+)\[(.*?)\]/g,
        (_match, nodeId, label) => {
          const escapedLabel = label
            .replace(/"/g, '&quot;')
            .replace(/\(/g, '&#40;')
            .replace(/\)/g, '&#41;');
          return `${nodeId}["${escapedLabel}"]`;
        }
      );
      
      // 处理圆括号形式的节点: NodeId("Label")
      sanitized = sanitized.replace(
        /(\w+)\("(.*?)"\)/g,
        (_match, nodeId, label) => {
          const escapedLabel = label
            .replace(/"/g, '&quot;')
            .replace(/\(/g, '&#40;')
            .replace(/\)/g, '&#41;');
          return `${nodeId}["${escapedLabel}"]`;
        }
      );
      
      // 处理无引号的简单节点: NodeId[Label]
      sanitized = sanitized.replace(
        /(\w+)\[([^\]]+)\]/g,
        (_match, nodeId, label) => {
          if (!label.includes('"')) {
            const escapedLabel = label
              .replace(/\(/g, '&#40;')
              .replace(/\)/g, '&#41;')
              .replace(/\[/g, '&#91;')
              .replace(/\]/g, '&#93;');
            return `${nodeId}["${escapedLabel}"]`;
          }
          return _match;
        }
      );
    }
    
    return sanitized;
  };

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // 清理 Mermaid 语法（移除代码块标记）
        let cleanChart = chart.trim();
        const codeBlockMatch = cleanChart.match(/```(?:mermaid)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          cleanChart = codeBlockMatch[1].trim();
        }

        // 检测是否为 Mermaid 语法
        const isMermaidSyntax = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|pie|gantt|journey|erDiagram|block-beta)/i.test(cleanChart);
        
        if (!isMermaidSyntax) {
          // 不是 Mermaid 语法，标记并返回
          setIsNotMermaid(true);
          return;
        }

        // 清理和转义特殊字符
        const sanitizedChart = sanitizeMermaidSyntax(cleanChart);

        // 生成唯一 ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // 渲染 SVG
        const { svg } = await mermaid.render(id, sanitizedChart);
        setSvg(svg);
        setError('');
        setIsNotMermaid(false);
      } catch (err) {
        console.error('Mermaid 渲染失败:', err);
        // 区分不同类型的错误
        const errorMessage = err instanceof Error ? err.message : '渲染失败';
        
        // 如果是语法解析错误，提供更友好的提示
        if (errorMessage.includes('Parse error') || errorMessage.includes('Syntax error')) {
          setError(`语法解析错误：${errorMessage}\n\n原始内容已降级为文本展示`);
        } else {
          setError(errorMessage);
        }
        
        setSvg('');
        setIsNotMermaid(false);
      }
    };

    if (chart) {
      renderDiagram();
    }
  }, [chart]);

  // 如果不是 Mermaid 语法，返回 null，由父组件处理
  if (isNotMermaid) {
    return null;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600 mb-2">⚠️ 图表渲染失败</p>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-2 rounded">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && <h4 className="text-sm font-semibold text-gray-700">{title}</h4>}
      <div 
        className="bg-white border border-gray-200 rounded-lg p-4 overflow-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

// 文本树形结构展示组件
const TextTreeDisplay: React.FC<{ tree: string; title?: string }> = ({ tree, title }) => {
  return (
    <div className="space-y-2">
      {title && <h4 className="text-sm font-semibold text-gray-700">{title}</h4>}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
          {tree}
        </pre>
      </div>
    </div>
  );
};

// 智能图表展示组件（自动判断是 Mermaid 还是文本树）
const SmartDiagramDisplay: React.FC<{ content: string; title?: string }> = ({ content, title }) => {
  const [isMermaid, setIsMermaid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!content) return;
    
    const cleanContent = content.trim();
    // 检测是否为 Mermaid 语法
    const hasMermaidSyntax = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|pie|gantt|journey|erDiagram|block-beta)/i.test(cleanContent);
    const hasCodeBlock = /```(?:mermaid)?\s*(graph|flowchart|block-beta)/i.test(cleanContent);
    
    setIsMermaid(hasMermaidSyntax || hasCodeBlock);
  }, [content]);

  if (!content) return null;

  // 如果检测到是 Mermaid 语法，使用 MermaidDiagram
  if (isMermaid === true) {
    return <MermaidDiagram chart={content} title={title} />;
  }
  
  // 如果检测到不是 Mermaid 语法，使用文本树展示
  if (isMermaid === false) {
    return <TextTreeDisplay tree={content} title={title} />;
  }

  // 检测中，显示 loading
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 size={24} className="animate-spin text-blue-600" />
    </div>
  );
};

export const RequirementsRefinementDialog: React.FC = () => {
  const { 
    showRefinementDialog, 
    refinedRequirements, 
    isRefiningRequirements,
    confirmAndGenerate, 
    cancelRefinement,
    setParams,
    generateComponent,
  } = useStore();

  const [editedDescription, setEditedDescription] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // 当弹窗打开时，初始化编辑内容
  useEffect(() => {
    if (showRefinementDialog && refinedRequirements) {
      setEditedDescription(refinedRequirements.refinedDescription);
    }
  }, [showRefinementDialog, refinedRequirements]);

  // 使用模板填充表单
  const handleUseTemplate = (template: typeof COMPONENT_TEMPLATES[0]['template']) => {
    setParams(template);
    setShowTemplates(false);
    // 关闭当前弹窗，重新触发生成流程
    cancelRefinement();
    setTimeout(() => {
      generateComponent();
    }, 100);
  };

  const handleConfirm = async () => {
    // 使用编辑后的描述
    if (editedDescription.trim()) {
      // 更新 refinedRequirements
      useStore.setState({
        refinedRequirements: refinedRequirements ? {
          ...refinedRequirements,
          refinedDescription: editedDescription,
        } : null,
      });
    }
    await confirmAndGenerate();
  };

  if (!showRefinementDialog) return null;

  return (
    <Dialog.Root open={showRefinementDialog} onOpenChange={(open) => !open && cancelRefinement()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-50">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-3">
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  需求整理与确认
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-1">
                  AI 已整理您的需求，请检查并确认后生成组件
                </Dialog.Description>
              </div>
              <button
                onClick={() => setShowTemplates(true)}
                className="ml-4 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                title="使用预设模板快速填充表单"
              >
                <BookOpen size={14} />
                <span>模板库</span>
              </button>
            </div>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          {/* 模板库弹窗 */}
          {showTemplates && (
            <div className="absolute inset-0 bg-white z-10 overflow-y-auto rounded-xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">组件模板库</h3>
                  <p className="text-sm text-gray-500 mt-1">选择常用组件模板，快速开始</p>
                </div>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMPONENT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleUseTemplate(template.template)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                            {template.name}
                          </h4>
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {isRefiningRequirements ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-blue-600 mb-4" />
                <p className="text-gray-700 font-medium mb-2">AI 正在分析您的需求...</p>
                <p className="text-sm text-gray-500">正在生成组件结构、功能点和原型示意图</p>
              </div>
            ) : refinedRequirements ? (
              <>
                {/* 整理后的需求描述 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">📝 整理后的需求描述</span>
                    <span className="text-xs text-gray-500">（可编辑）</span>
                  </div>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm text-gray-700 bg-gray-50"
                    rows={8}
                  />
                </div>

                {/* 组件结构 - 智能展示（支持 Mermaid 和文本树） */}
                {refinedRequirements.componentStructure && (
                  <SmartDiagramDisplay 
                    content={refinedRequirements.componentStructure}
                    title="🏗️ 组件结构图"
                  />
                )}

                {/* 功能点列表 */}
                {refinedRequirements.features && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">✨ 功能点</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <ul className="space-y-2">
                        {safeParseJSONArray(refinedRequirements.features).map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 原型示意图 - 智能展示（支持 Mermaid、ASCII 和文本树） */}
                {refinedRequirements.prototypeDiagram && (
                  <SmartDiagramDisplay 
                    content={refinedRequirements.prototypeDiagram}
                    title="🎨 原型示意图"
                  />
                )}

                {/* 技术要点 */}
                {refinedRequirements.technicalNotes && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">⚙️ 技术要点</h4>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <ul className="space-y-2">
                        {safeParseJSONArray(refinedRequirements.technicalNotes).map((note: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                暂无需求整理数据
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl">
            <button
              onClick={cancelRefinement}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={isRefiningRequirements}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isRefiningRequirements ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>整理中...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>确认生成</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
