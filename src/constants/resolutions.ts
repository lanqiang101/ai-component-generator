
import type { PreviewResolution, ResolutionPreset } from '../types';

export const resolutionPresets: Record<PreviewResolution, ResolutionPreset> = {
  mobile: {
    key: 'mobile',
    label: '移动端 360×640',
    width: 360,
    height: 640,
  },
  tablet: {
    key: 'tablet',
    label: '平板 768×1024',
    width: 768,
    height: 1024,
  },
  laptop: {
    key: 'laptop',
    label: '笔记本 1366×768',
    width: 1366,
    height: 768,
  },
  desktop: {
    key: 'desktop',
    label: '桌面 1920×1080',
    width: 1920,
    height: 1080,
  },
  full: {
    key: 'full',
    label: '全屏自适应',
    width: '100%',
    height: '100%',
  },
};

export const resolutionList = Object.values(resolutionPresets);
