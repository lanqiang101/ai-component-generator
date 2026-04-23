// English translations
export const en = {
  // Common
  common: {
    appName: 'AI Component Generator',
    appSubtitle: 'Intelligent Frontend Component Generator',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    copy: 'Copy',
    download: 'Download',
    generate: 'Generate',
    generating: 'Generating...',
  },

  // Header
  header: {
    darkModeAuto: 'Auto (Follow System)',
    darkModeLight: 'Light Mode',
    darkModeDark: 'Dark Mode',
  },

  // Left Form Panel
  form: {
    componentName: 'Component Name',
    componentNamePlaceholder: 'e.g., Login Form, Product Card',
    componentDescription: 'Component Description',
    descriptionPlaceholder: 'Describe the functionality of this component in detail. Click AI Expand to make the description more professional...',
    aiExpand: 'AI Expand',
    expanding: 'Expanding...',
    expandTip: 'Enter a brief description and click "AI Expand" to let AI help you improve it',
    framework: 'Programming Language / Framework',
    componentType: 'Component Type',
    uiStyle: 'UI Design Style',
    dimensions: 'Dimensions',
    dimensionsPlaceholder: 'e.g., Width 100%, Height 48px',
    dimensionsTip: 'Describe expected component size, leave empty for adaptive',
    needMockData: 'Need Default Mock Data',
    on: 'On',
    off: 'Off',
    needInteraction: 'Need Interactive Events',
    uiLibrary: 'UI Component Library',
    uiLibraryTip: 'Available options are automatically filtered based on selected framework',
    uiLibraryVersion: 'UI Library Version',
    stylePreprocessor: 'Style Preprocessor',
    extraRequirements: 'Extra Requirements',
    extraRequirementsPlaceholder: 'Any other requirements or special requests...',
    
    // Component types
    button: 'Button',
    card: 'Card',
    form: 'Form',
    navbar: 'Navbar',
    modal: 'Modal',
    dropdown: 'Dropdown',
    table: 'Table',
    chart: 'Chart',
    other: 'Other Custom',
    
    // UI styles
    minimal: 'Minimal Modern',
    neumorphism: 'Neumorphism',
    glassmorphism: 'Glassmorphism',
    cyberpunk: 'Cyberpunk',
    retro: 'Retro',
    material: 'Material Design',
    antd: 'Ant Design Style',
    
    // Style preprocessors
    css: 'Plain CSS',
    scss: 'SCSS',
    less: 'LESS',
    tailwind: 'Tailwind CSS',
  },

  // Preview Panel
  preview: {
    title: 'Component Preview',
    device: 'Device',
    size: 'Size',
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    codeTest: 'Code Test',
    hideTest: 'Hide Test',
    pasteCodePlaceholder: `Paste React component code here, then click 'Render Test' button...

Example code:
import React from 'react';

const TestButton = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <button 
      onClick={() => setCount(count + 1)}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Clicks: {count}
    </button>
  );
};

export default TestButton;`,
    renderTest: 'Render Test',
    clear: 'Clear',
    testResult: 'Test Result',
    syntaxError: 'Syntax Error',
    errorHint: 'Tip: Check the code in the left editor, fix syntax errors and it will auto re-preview',
    checkSyntax: 'Please check if the code syntax is correct',
    fullscreenAdaptive: 'Fullscreen Adaptive',
    laptopSize: 'Laptop',
    desktopSize: 'Desktop',
    surfacePro7: 'Surface Pro 7',
    ipadMini: 'iPad Mini',
    ipadAir: 'iPad Air',
    ipadPro: 'iPad Pro',
    surfaceDuo: 'Surface Duo',
    iphoneSE: 'iPhone SE',
    iphoneXR: 'iPhone XR',
    iphone12Pro: 'iPhone 12 Pro',
    iphone14ProMax: 'iPhone 14 Pro Max',
    pixel7: 'Pixel 7',
    pixel7Pro: 'Pixel 7 Pro',
    galaxyS8: 'Galaxy S8+',
    galaxyS20Ultra: 'Galaxy S20 Ultra',
    galaxyZFold5: 'Galaxy Z Fold 5',
    galaxyA51: 'Galaxy A51/71',
    zenbookFold: 'Zenbook Fold',
    nestHub: 'Nest Hub',
    nestHubMax: 'Nest Hub Max',
  },

  // Code Editor Panel
  codeEditor: {
    title: 'Component Code',
    currentFile: 'Current File',
    lines: 'lines',
    copied: 'Copied',
    copy: 'Copy',
    download: 'Download',
    aiFix: 'AI Fix',
    fixing: 'Fixing...',
    fixSuccess: 'Fixed',
    noError: 'No syntax errors found',
    noCode: 'Click "Generate Component" button on the left to start',
    placeholder: '// Generated component code will display here, you can edit directly...',
    fixError: 'Fix Error',
    fixHint: 'AI will analyze and fix syntax errors in the current file',
  },

  // Generation Progress
  progress: {
    analyzing: 'Analyzing requirements...',
    generating: 'Generating component...',
    completed: 'Generation completed!',
    failed: 'Generation failed',
  },

  // Requirements Refinement Dialog
  refinement: {
    title: 'Requirement Analysis',
    refinedDescription: 'Refined Description',
    componentStructure: 'Component Structure',
    features: 'Features',
    prototypeDiagram: 'Prototype Diagram',
    technicalNotes: 'Technical Notes',
    confirmAndGenerate: 'Confirm & Generate',
    cancel: 'Cancel',
  },

  // Model Management
  modelManagement: {
    title: 'Model Management',
    addModel: 'Add Model',
    editModel: 'Edit Model',
    modelName: 'Model Name',
    baseUrl: 'Base URL',
    apiKey: 'API Key',
    modelId: 'Model ID',
    temperature: 'Temperature',
    maxTokens: 'Max Tokens',
    actions: 'Actions',
    noModels: 'No models configured yet',
    addFirstModel: 'Add your first model',
  },

  // Config Page
  config: {
    title: 'System Configuration',
    selectModel: 'Select Model',
    noModelSelected: 'No model selected',
    pleaseSelectModel: 'Please select a model for component generation',
    goToModelManagement: 'Go to Model Management',
  },

  // Error Messages
  errors: {
    fillRequiredFields: 'Please fill in component name and description',
    expansionFailed: 'Expansion failed',
    generationFailed: 'Generation failed',
    networkError: 'Network error, please try again',
    invalidConfig: 'Invalid configuration',
  },

  // Success Messages
  success: {
    copied: 'Copied to clipboard',
    downloaded: 'File downloaded',
    generated: 'Component generated successfully',
  },
};
