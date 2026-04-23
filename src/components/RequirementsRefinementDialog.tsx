import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Check, AlertCircle, BookOpen, ChevronRight } from 'lucide-react';
import mermaid from 'mermaid';
import { useStore } from '../store/useStore';
import type { ComponentGenerationParams } from '../types';
import { useTranslation } from '../i18n';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

// Helper function to safely parse JSON array
const safeParseJSONArray = (value: string | unknown): string[] => {
  if (!value) return [];
  
  // If already an array, return directly
  if (Array.isArray(value)) return value;
  
  // Try to parse JSON
  try {
    const parsed = JSON.parse(value as string);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.warn('JSON parse failed, fallback to plain text:', value);
  }
  
  // Fallback: if string, split by newline or comma
  if (typeof value === 'string') {
    return value.split(/[\n,，]/).map(item => item.trim()).filter(Boolean);
  }
  
  return [];
};

// Common component template library
const COMPONENT_TEMPLATES: Array<{
  id: string;
  name: string;
  icon: string;
  description: string;
  template: Partial<ComponentGenerationParams>;
}> = [
  {
    id: 'product-card',
    name: 'Product Card',
    icon: '🛍️',
    description: 'E-commerce product display card with image, price, title, etc.',
    template: {
      componentName: 'ProductCard',
      description: 'An e-commerce product display card component for showcasing core product information in product list pages. The component should include product main image, title, price, promotional tags and other elements, supporting hover effects and click navigation. Adopts minimalist modern style, adaptive container width.',
      componentType: 'card',
      style: 'minimal',
      needMockData: true,
      interactive: true,
    },
  },
  {
    id: 'navbar',
    name: 'Navigation Bar',
    icon: '🧭',
    description: 'Top navigation bar with Logo, menu, search box',
    template: {
      componentName: 'NavigationBar',
      description: 'Responsive top navigation bar component including brand Logo, main navigation menu, search box and user action area. Supports mobile collapsible menu with smooth transition animations and background changes on scroll.',
      componentType: 'navbar',
      style: 'minimal',
      needMockData: true,
      interactive: true,
    },
  },
  {
    id: 'data-table',
    name: 'Data Table',
    icon: '📊',
    description: 'Sortable, paginated data table component',
    template: {
      componentName: 'DataTable',
      description: 'Full-featured data table component supporting column sorting, pagination, row selection, batch operations and more. Fixed header with scrollable content area. Provides search filtering and export functionality. Modern design style with dark mode support.',
      componentType: 'table',
      style: 'material',
      needMockData: true,
      interactive: true,
    },
  },
  {
    id: 'login-form',
    name: 'Login Form',
    icon: '🔐',
    description: 'User login form with email, password input and validation',
    template: {
      componentName: 'LoginForm',
      description: 'User login form component including email/phone input, password input (with show/hide toggle), remember me option and forgot password link. Features real-time form validation, error messages and loading states. Supports keyboard navigation and accessibility.',
      componentType: 'form',
      style: 'minimal',
      needMockData: false,
      interactive: true,
    },
  },
  {
    id: 'image-gallery',
    name: 'Image Gallery',
    icon: '🖼️',
    description: 'Image display gallery with thumbnail and lightbox effect',
    template: {
      componentName: 'ImageGallery',
      description: 'Responsive image gallery component displaying multiple images in grid layout. Supports lazy loading, click to enlarge (lightbox effect), left/right swipe to switch, and thumbnail navigation. Features elegant loading animations and transition effects.',
      componentType: 'other',
      style: 'glassmorphism',
      needMockData: true,
      interactive: true,
    },
  },
  {
    id: 'timeline',
    name: 'Timeline',
    icon: '⏱️',
    description: 'Vertical timeline to display event development',
    template: {
      componentName: 'Timeline',
      description: 'Vertical timeline component for displaying project progress, historical records, or event flows. Each timeline node includes date, title, description, and optional icon. Supports alternating layout and single-sided layout with scroll-in animation effects.',
      componentType: 'other',
      style: 'minimal',
      needMockData: true,
      interactive: false,
    },
  },
];

// Mermaid diagram rendering component
const MermaidDiagram: React.FC<{ chart: string; title?: string }> = ({ chart, title }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isNotMermaid, setIsNotMermaid] = useState(false);

  // Sanitize and escape special characters in Mermaid node text
  const sanitizeMermaidSyntax = (mermaidCode: string): string => {
    let sanitized = mermaidCode;
    
    // Step 1: Decode JSON escape sequences first
    // When AI returns Mermaid code in JSON, special chars are JSON-escaped
    sanitized = sanitized
      .replace(/\\"/g, '"')      // JSON-escaped quotes -> normal quotes
      .replace(/\\n/g, '\n')     // JSON-escaped newlines
      .replace(/\\t/g, '\t')     // JSON-escaped tabs
      .replace(/\\\\/g, '\\');   // JSON-escaped backslashes
    
    // Detect if it's block-beta syntax
    const isBlockBeta = /^\s*block-beta/i.test(sanitized.trim());
    
    if (isBlockBeta) {
      // Special handling for block-beta syntax
      // Match pattern: NodeId["Label"] or NodeId[Label]
      // Use a more robust regex that handles quotes and brackets inside labels
      sanitized = sanitized.replace(
        /(\w+)\[([^\]]*(?:\][^\[]*)*)\]/g,
        (_match, nodeId, label) => {
          // Clean the label: remove surrounding quotes if present
          let cleanLabel = label.trim();
          if ((cleanLabel.startsWith('"') && cleanLabel.endsWith('"')) ||
              (cleanLabel.startsWith("'") && cleanLabel.endsWith("'"))) {
            cleanLabel = cleanLabel.slice(1, -1);
          }
          
          // Now apply Mermaid escaping
          const escapedLabel = cleanLabel
            .replace(/\\/g, '\\\\')  // Escape backslashes first
            .replace(/"/g, '\\"')     // Escape double quotes
            .replace(/\(/g, '\\(')    // Escape parentheses
            .replace(/\)/g, '\\)')
            .replace(/\[/g, '\\[')    // Escape brackets
            .replace(/\]/g, '\\]');
          
          return `${nodeId}["${escapedLabel}"]`;
        }
      );
      
      // Handle simple form without quotes: NodeId Label (block-beta specific syntax)
      // This format in block-beta represents a node and needs to be converted to quoted form
      sanitized = sanitized.replace(
        /^(\s*)(\w+)\s+([^[\]\n"]+)$/gm,
        (match, indent, nodeId, label) => {
          // Exclude keywords like columns, space, block, end, etc.
          const keywords = ['columns', 'space', 'block', 'end', 'stack'];
          if (!keywords.includes(nodeId.toLowerCase())) {
            const escapedLabel = label.trim()
              .replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\(/g, '\\(')
              .replace(/\)/g, '\\)');
            return `${indent}${nodeId}["${escapedLabel}"]`;
          }
          return match;
        }
      );
    } else {
      // Handling for graph/flowchart syntax
      // Handle bracketed node form: NodeId[Label with special chars]
      sanitized = sanitized.replace(
        /(\w+)\[([^\]]*(?:\][^\[]*)*)\]/g,
        (_match, nodeId, label) => {
          // Clean the label: remove surrounding quotes if present
          let cleanLabel = label.trim();
          if ((cleanLabel.startsWith('"') && cleanLabel.endsWith('"')) ||
              (cleanLabel.startsWith("'") && cleanLabel.endsWith("'"))) {
            cleanLabel = cleanLabel.slice(1, -1);
          }
          
          const escapedLabel = cleanLabel
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
          return `${nodeId}["${escapedLabel}"]`;
        }
      );
      
      // Handle quoted node form: NodeId("Label")
      sanitized = sanitized.replace(
        /(\w+)\("(.*?)"\)/g,
        (_match, nodeId, label) => {
          const escapedLabel = label
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
          return `${nodeId}["${escapedLabel}"]`;
        }
      );
      
      // Handle simple node without quotes: NodeId[Label]
      sanitized = sanitized.replace(
        /(\w+)\[([^\]]+)\]/g,
        (_match, nodeId, label) => {
          if (!label.includes('"')) {
            const escapedLabel = label
              .replace(/\\/g, '\\\\')
              .replace(/\(/g, '\\(')
              .replace(/\)/g, '\\)')
              .replace(/\[/g, '\\[')
              .replace(/\]/g, '\\]');
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
        // Clean Mermaid syntax (remove code block markers)
        let cleanChart = chart.trim();
        const codeBlockMatch = cleanChart.match(/```(?:mermaid)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          cleanChart = codeBlockMatch[1].trim();
        }

        // Detect if it's Mermaid syntax
        const isMermaidSyntax = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|pie|gantt|journey|erDiagram|block-beta)/i.test(cleanChart);
        
        if (!isMermaidSyntax) {
          // Not Mermaid syntax, mark and return
          setIsNotMermaid(true);
          return;
        }

        // Sanitize and escape special characters
        const sanitizedChart = sanitizeMermaidSyntax(cleanChart);

        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render SVG
        const { svg } = await mermaid.render(id, sanitizedChart);
        setSvg(svg);
        setError('');
        setIsNotMermaid(false);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        // Differentiate different types of errors
        const errorMessage = err instanceof Error ? err.message : 'Rendering failed';
        
        // If it's a syntax parsing error, provide a more friendly prompt
        if (errorMessage.includes('Parse error') || errorMessage.includes('Syntax error')) {
          setError(`Syntax parsing error：${errorMessage}\n\nOriginal content has been downgraded to text display`);
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

  // If not Mermaid syntax, return null, handled by parent component
  if (isNotMermaid) {
    return null;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600 mb-2">⚠️ Chart rendering failed</p>
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

// Text tree structure display component
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

// Smart chart display component (automatically determine if it's Mermaid or text tree)
const SmartDiagramDisplay: React.FC<{ content: string; title?: string }> = ({ content, title }) => {
  const [isMermaid, setIsMermaid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!content) return;
    
    const cleanContent = content.trim();
    // Detect if it's Mermaid syntax
    const hasMermaidSyntax = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|pie|gantt|journey|erDiagram|block-beta)/i.test(cleanContent);
    const hasCodeBlock = /```(?:mermaid)?\s*(graph|flowchart|block-beta)/i.test(cleanContent);
    
    setIsMermaid(hasMermaidSyntax || hasCodeBlock);
  }, [content]);

  if (!content) return null;

  // If detected as Mermaid syntax, use MermaidDiagram
  if (isMermaid === true) {
    return <MermaidDiagram chart={content} title={title} />;
  }
  
  // If detected as not Mermaid syntax, use text tree display
  if (isMermaid === false) {
    return <TextTreeDisplay tree={content} title={title} />;
  }

  // Detecting, show loading
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
  const { t } = useTranslation();

  const [editedDescription, setEditedDescription] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // Initialize edit content when dialog opens
  useEffect(() => {
    if (showRefinementDialog && refinedRequirements) {
      setEditedDescription(refinedRequirements.refinedDescription);
    }
  }, [showRefinementDialog, refinedRequirements]);

  // Use template to fill form
  const handleUseTemplate = (template: typeof COMPONENT_TEMPLATES[0]['template']) => {
    setParams(template);
    setShowTemplates(false);
    // Close current dialog, re-trigger generation process
    cancelRefinement();
    setTimeout(() => {
      generateComponent();
    }, 100);
  };

  const handleConfirm = async () => {
    // Use edited description
    if (editedDescription.trim()) {
      // Update refinedRequirements
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
                  {t.refinement.title}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-1">
                  AI has analyzed your requirements. Please review and confirm to generate the component.
                </Dialog.Description>
              </div>
              <button
                onClick={() => setShowTemplates(true)}
                className="ml-4 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                title="Use preset templates to quickly fill the form"
              >
                <BookOpen size={14} />
                <span>Template Library</span>
              </button>
            </div>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          {/* Template library dialog */}
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
                <p className="text-gray-700 font-medium mb-2">{t.progress.analyzing}</p>
                <p className="text-sm text-gray-500">Generating component structure, features, and prototype diagram</p>
              </div>
            ) : refinedRequirements ? (
              <>
                {/* Refined requirement description */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">📝 {t.refinement.refinedDescription}</span>
                    <span className="text-xs text-gray-500">（Editable）</span>
                  </div>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm text-gray-700 bg-gray-50"
                    rows={8}
                  />
                </div>

                {/* Component Structure - Smart display (supports Mermaid and text tree) */}
                {refinedRequirements.componentStructure && (
                  <SmartDiagramDisplay 
                    content={refinedRequirements.componentStructure}
                    title="🏗️ Component Structure"
                  />
                )}

                {/* Feature list */}
                {refinedRequirements.features && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">✨ {t.refinement.features}</h4>
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

                {/* Prototype diagram - Smart display (supports Mermaid, ASCII and text tree) */}
                {refinedRequirements.prototypeDiagram && (
                  <SmartDiagramDisplay 
                    content={refinedRequirements.prototypeDiagram}
                    title="🎨 Prototype Diagram"
                  />
                )}

                {/* Technical Notes */}
                {refinedRequirements.technicalNotes && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">⚙️ {t.refinement.technicalNotes}</h4>
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
                No requirement data available
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl">
            <button
              onClick={cancelRefinement}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isRefiningRequirements}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isRefiningRequirements ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.common.generating}</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{t.refinement.confirmAndGenerate}</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
