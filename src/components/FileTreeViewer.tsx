import { useState, useMemo } from 'react';
import { File, Folder, ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { checkCommonSyntaxErrors } from '../utils/previewUtils';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  hasError?: boolean;
}

interface FileTreeViewerProps {
  files: Array<{
    name: string;
    path: string;
    code: string;
  }>;
  activeFilePath: string;
  onFileSelect: (filePath: string) => void;
}

// Convert flat File list to tree structure
function buildFileTree(files: FileTreeViewerProps['files']): FileNode[] {
  const root: FileNode[] = [];
  const map = new Map<string, FileNode>();

  // First create all Folder nodes
  files.forEach(file => {
    const parts = file.path.split('/');
    let currentPath = '';
    
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!map.has(currentPath)) {
        // Check if file has syntax errors
        const hasError = isFile && checkCommonSyntaxErrors(file.code).length > 0;
        
        const node: FileNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
          hasError: isFile ? hasError : undefined
        };
        map.set(currentPath, node);
        
        // Add to parent node
        if (index === 0) {
          root.push(node);
        } else {
          const parentPath = parts.slice(0, index).join('/');
          const parent = map.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        }
      }
    });
  });

  return root;
}

// Recursively render File Tree nodes
function TreeNode({ 
  node, 
  depth = 0, 
  activeFilePath, 
  onFileSelect 
}: { 
  node: FileNode; 
  depth: number;
  activeFilePath: string;
  onFileSelect: (filePath: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Expand first two levels by default
  const isActive = node.path === activeFilePath;
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors',
          'hover:bg-gray-100',
          isActive && 'bg-blue-50 text-blue-600'
        )}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {node.type === 'folder' ? (
          <>
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              )
            ) : (
              <span className="w-3.5 flex-shrink-0" />
            )}
            <Folder size={14} className={cn(
              'flex-shrink-0',
              isExpanded ? 'text-blue-500' : 'text-gray-400'
            )} />
          </>
        ) : (
          <>
            <span className="w-3.5 flex-shrink-0" />
            <File size={14} className={cn(
              'flex-shrink-0',
              isActive ? 'text-blue-600' : 'text-gray-500'
            )} />
          </>
        )}
        <span className={cn(
          'truncate',
          node.type === 'folder' && 'font-medium',
          isActive && 'font-medium',
          node.hasError && 'text-red-600 font-medium'
        )}>
          {node.name}
        </span>
        {node.hasError && (
          <AlertCircle size={12} className="text-red-500 flex-shrink-0 ml-1" />
        )}
      </button>
      
      {node.type === 'folder' && isExpanded && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFilePath={activeFilePath}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTreeViewer({ files, activeFilePath, onFileSelect }: FileTreeViewerProps) {
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-48 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-2 border-b border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3">
          File结构
        </div>
      </div>
      <div className="py-1">
        {fileTree.map(node => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            activeFilePath={activeFilePath}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}
