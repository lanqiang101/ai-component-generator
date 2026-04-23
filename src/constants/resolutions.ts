import type { PreviewResolution, ResolutionPreset } from '../types';

export const resolutionPresets: Record<PreviewResolution, ResolutionPreset> = {
  // Fullscreen adaptive
  full: {
    key: 'full',
    label: 'Fullscreen Adaptive',
    width: '100%',
    height: '100%',
  },
  
  // iPhone series
  'iphone-se': {
    key: 'iphone-se',
    label: 'iPhone SE (375×667)',
    width: 375,
    height: 667,
  },
  'iphone-xr': {
    key: 'iphone-xr',
    label: 'iPhone XR (414×896)',
    width: 414,
    height: 896,
  },
  'iphone-12-pro': {
    key: 'iphone-12-pro',
    label: 'iPhone 12 Pro (390×844)',
    width: 390,
    height: 844,
  },
  'iphone-14-pro-max': {
    key: 'iphone-14-pro-max',
    label: 'iPhone 14 Pro Max (430×932)',
    width: 430,
    height: 932,
  },
  
  // Google Pixel series
  'pixel-7': {
    key: 'pixel-7',
    label: 'Pixel 7 (412×915)',
    width: 412,
    height: 915,
  },
  'pixel-7-pro': {
    key: 'pixel-7-pro',
    label: 'Pixel 7 Pro (480×1024)',
    width: 480,
    height: 1024,
  },
  
  // Samsung Galaxy series
  'galaxy-s8': {
    key: 'galaxy-s8',
    label: 'Galaxy S8+ (360×740)',
    width: 360,
    height: 740,
  },
  'galaxy-s20-ultra': {
    key: 'galaxy-s20-ultra',
    label: 'Galaxy S20 Ultra (412×915)',
    width: 412,
    height: 915,
  },
  'galaxy-z-fold5': {
    key: 'galaxy-z-fold5',
    label: 'Galaxy Z Fold 5 (674×904)',
    width: 674,
    height: 904,
  },
  'galaxy-a51': {
    key: 'galaxy-a51',
    label: 'Galaxy A51/71 (412×914)',
    width: 412,
    height: 914,
  },
  
  // iPad series
  'ipad-mini': {
    key: 'ipad-mini',
    label: 'iPad Mini (768×1024)',
    width: 768,
    height: 1024,
  },
  'ipad-air': {
    key: 'ipad-air',
    label: 'iPad Air (820×1180)',
    width: 820,
    height: 1180,
  },
  'ipad-pro': {
    key: 'ipad-pro',
    label: 'iPad Pro (1024×1366)',
    width: 1024,
    height: 1366,
  },
  
  // Surface series
  'surface-duo': {
    key: 'surface-duo',
    label: 'Surface Duo (540×720)',
    width: 540,
    height: 720,
  },
  'surface-pro7': {
    key: 'surface-pro7',
    label: 'Surface Pro 7 (912×1368)',
    width: 912,
    height: 1368,
  },
  
  // Foldable screens
  'zenbook-fold': {
    key: 'zenbook-fold',
    label: 'Zenbook Fold (853×1280)',
    width: 853,
    height: 1280,
  },
  
  // Nest Hub
  'nest-hub': {
    key: 'nest-hub',
    label: 'Nest Hub (1024×600)',
    width: 1024,
    height: 600,
  },
  'nest-hub-max': {
    key: 'nest-hub-max',
    label: 'Nest Hub Max (1280×800)',
    width: 1280,
    height: 800,
  },
  
  // Traditional devices
  laptop: {
    key: 'laptop',
    label: 'Laptop (1366×768)',
    width: 1366,
    height: 768,
  },
  desktop: {
    key: 'desktop',
    label: 'Desktop (1920×1080)',
    width: 1920,
    height: 1080,
  },
};

// 按类别分组的分辨率列表
export const resolutionCategories = {
  standard: ['full'],
  phones: ['iphone-se', 'iphone-xr', 'iphone-12-pro', 'iphone-14-pro-max', 'pixel-7', 'pixel-7-pro', 'galaxy-s8', 'galaxy-s20-ultra', 'galaxy-z-fold5', 'galaxy-a51'],
  tablets: ['ipad-mini', 'ipad-air', 'ipad-pro', 'surface-duo', 'surface-pro7', 'zenbook-fold'],
  displays: ['nest-hub', 'nest-hub-max'],
  computers: ['laptop', 'desktop'],
};

// 展平所有分辨率选项（用于下拉列表）
export const resolutionList = Object.values(resolutionPresets);

// 带分组的分辨率列表（用于分类显示）
export const resolutionListGrouped = Object.entries(resolutionCategories).map(([category, keys]) => ({
  category: category as keyof typeof resolutionCategories,
  items: keys.map(key => resolutionPresets[key as PreviewResolution]),
}));