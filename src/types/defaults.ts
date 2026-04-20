
import type { ComponentGenerationParams } from './index';

export const defaultComponentParams: ComponentGenerationParams = {
  componentName: '',
  description: '',
  framework: 'react-tsx',
  componentType: 'button',
  style: 'minimal',
  dimensions: '',
  needMockData: true,
  interactive: true,
  uiLibrary: 'none',
  uiLibraryVersion: '',
  stylePreprocessor: 'tailwind',
  extraRequirements: '',
};
