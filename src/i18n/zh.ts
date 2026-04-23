// Chinese translations
export const zh = {
  // Common
  common: {
    appName: 'AI 组件生成器',
    appSubtitle: '智能生成前端组件',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    copy: '复制',
    download: '下载',
    generate: '生成',
    generating: '生成中...',
  },

  // Header
  header: {
    darkModeAuto: '自动（跟随系统）',
    darkModeLight: '浅色模式',
    darkModeDark: '暗黑模式',
  },

  // Left Form Panel
  form: {
    componentName: '组件名称',
    componentNamePlaceholder: '比如：登录表单、商品卡片',
    componentDescription: '组件描述',
    descriptionPlaceholder: '详细描述这个组件的功能，点击 AI 扩写让描述更专业...',
    aiExpand: 'AI 扩写',
    expanding: '扩写中...',
    expandTip: '简短描述后点击"AI 扩写"让 AI 帮你完善描述',
    framework: '编程语言 / 框架',
    componentType: '组件类型',
    uiStyle: 'UI 设计风格',
    dimensions: '尺寸规格',
    dimensionsPlaceholder: '比如：宽度 100%，高度 48px',
    dimensionsTip: '描述组件预期尺寸，留空则自适应',
    needMockData: '需要默认 Mock 数据',
    on: '开启',
    off: '关闭',
    needInteraction: '需要交互事件',
    uiLibrary: 'UI 组件库',
    uiLibraryTip: '根据所选框架自动过滤可用选项',
    uiLibraryVersion: 'UI 库版本',
    stylePreprocessor: '样式预处理',
    extraRequirements: '额外需求',
    extraRequirementsPlaceholder: '任何其他需求或特殊要求...',
    
    // Component types
    button: '按钮',
    card: '卡片',
    form: '表单',
    navbar: '导航栏',
    modal: '模态框',
    dropdown: '下拉菜单',
    table: '表格',
    chart: '图表',
    other: '其他自定义',
    
    // UI styles
    minimal: '简约现代',
    neumorphism: '新拟物化 Neumorphism',
    glassmorphism: '玻璃拟态 Glassmorphism',
    cyberpunk: '赛博朋克',
    retro: '复古',
    material: 'Material Design',
    antd: 'Ant Design 风格',
    
    // Style preprocessors
    css: '原生 CSS',
    scss: 'SCSS',
    less: 'LESS',
    tailwind: 'Tailwind CSS',
  },

  // Preview Panel
  preview: {
    title: '组件预览',
    device: '设备',
    size: '尺寸',
    desktop: '桌面',
    tablet: '平板',
    mobile: '手机',
    codeTest: '代码测试',
    hideTest: '隐藏测试',
    pasteCodePlaceholder: `在此粘贴 React 组件代码，然后点击'渲染测试'按钮...

示例代码：
import React from 'react';

const TestButton = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <button 
      onClick={() => setCount(count + 1)}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      点击次数: {count}
    </button>
  );
};

export default TestButton;`,
    renderTest: '渲染测试',
    clear: '清空',
    testResult: '测试结果',
    syntaxError: '代码存在语法错误',
    errorHint: '提示：请检查左侧代码编辑器中的代码，修复语法错误后自动重新预览',
    checkSyntax: '请检查代码语法是否正确',
    fullscreenAdaptive: '全屏自适应',
    laptopSize: '笔记本',
    desktopSize: '桌面',
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
    title: '组件代码',
    currentFile: '当前文件',
    lines: '行',
    copied: '已复制',
    copy: '复制',
    download: '下载',
    aiFix: 'AI修复',
    fixing: '修复中...',
    fixSuccess: '修复完成',
    noError: '未发现语法错误',
    noCode: '点击左侧"生成组件"按钮开始',
    placeholder: '// 生成的组件代码会显示在这里，您可以直接编辑...',
    fixError: '修复失败',
    fixHint: 'AI将分析并修复当前文件中的语法错误',
  },

  // Generation Progress
  progress: {
    analyzing: '分析需求中...',
    generating: '生成组件中...',
    completed: '生成完成！',
    failed: '生成失败',
  },

  // Requirements Refinement Dialog
  refinement: {
    title: '需求分析',
    refinedDescription: '整理后的描述',
    componentStructure: '组件结构',
    features: '功能点',
    prototypeDiagram: '原型图',
    technicalNotes: '技术要点',
    confirmAndGenerate: '确认并生成',
    cancel: '取消',
  },

  // Model Management
  modelManagement: {
    title: '模型管理',
    addModel: '添加模型',
    editModel: '编辑模型',
    modelName: '模型名称',
    baseUrl: '基础 URL',
    apiKey: 'API Key',
    modelId: '模型标识',
    temperature: 'Temperature',
    maxTokens: 'Max Tokens',
    actions: '操作',
    noModels: '尚未配置任何模型',
    addFirstModel: '添加你的第一个模型',
  },

  // Config Page
  config: {
    title: '系统配置',
    selectModel: '选择模型',
    noModelSelected: '未选择模型',
    pleaseSelectModel: '请选择用于组件生成的模型',
    goToModelManagement: '前往模型管理',
  },

  // Error Messages
  errors: {
    fillRequiredFields: '请填写组件名称和描述',
    expansionFailed: '扩写失败',
    generationFailed: '生成失败',
    networkError: '网络错误，请重试',
    invalidConfig: '配置无效',
  },

  // Success Messages
  success: {
    copied: '已复制到剪贴板',
    downloaded: '文件已下载',
    generated: '组件生成成功',
  },
};
