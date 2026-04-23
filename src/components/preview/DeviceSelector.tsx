import React, { useState } from 'react';
import type { PreviewResolution } from "../../types";
import { resolutionPresets } from "../../constants/resolutions";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, Monitor, Smartphone, Tablet } from "lucide-react";
import { getResolutionLabel } from '../../utils/previewUtils';

// Device type definition
type DeviceType = 'desktop' | 'tablet' | 'mobile';

// Device type configuration
const getDevicePresets = (t: any) => ({
  desktop: {
    label: t.preview.desktop,
    icon: Monitor,
    resolutions: ['full', 'laptop', 'desktop', 'surface-pro7'] as PreviewResolution[],
  },
  tablet: {
    label: t.preview.tablet,
    icon: Tablet,
    resolutions: ['ipad-mini', 'ipad-air', 'ipad-pro', 'surface-duo'] as PreviewResolution[],
  },
  mobile: {
    label: t.preview.mobile,
    icon: Smartphone,
    resolutions: ['iphone-se', 'iphone-xr', 'iphone-12-pro', 'iphone-14-pro-max', 'pixel-7', 'pixel-7-pro'] as PreviewResolution[],
  },
});

interface DeviceSelectorProps {
  resolution: PreviewResolution;
  onResolutionChange: (resolution: PreviewResolution) => void;
  t: any;
  language: 'en' | 'zh';
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  resolution,
  onResolutionChange,
  t,
  language,
}) => {
  const devicePresets = getDevicePresets(t);
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    if (resolution === 'full' || resolution.includes('macbook') || resolution.includes('surface')) {
      return 'desktop';
    }
    if (resolution.includes('ipad') || resolution.includes('surface-go')) {
      return 'tablet';
    }
    return 'mobile';
  });

  const handleDeviceTypeChange = (type: DeviceType) => {
    setDeviceType(type);
    const config = devicePresets[type];
    if (config.resolutions.length > 0) {
      onResolutionChange(config.resolutions[0]);
    }
  };

  return (
    <div className="flex items-center justify-between mb-3">
      {/* Left: Device type switch */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t.preview.device}
        </span>
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
          {(Object.keys(devicePresets) as DeviceType[]).map((type) => {
            const config = devicePresets[type];
            const Icon = config.icon;
            const isActive = deviceType === type;
            
            return (
              <button
                key={type}
                onClick={() => handleDeviceTypeChange(type)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
                  ${isActive 
                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-slate-600/50'
                  }
                `}
              >
                <Icon size={16} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Right: Specific Device Size selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t.preview.size}
        </span>
        <Select.Root
          value={resolution}
          onValueChange={(value) => onResolutionChange(value as PreviewResolution)}
        >
          <Select.Trigger className="inline-flex items-center justify-between px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-50 min-w-[180px] transition-colors duration-150">
            <Select.Value placeholder={language === 'en' ? 'Select device size' : '选择Device Size'} />
            <Select.Icon className="ml-2">
              <ChevronDown size={14} />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className="overflow-hidden bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50 max-h-[60vh]"
              position="popper"
              sideOffset={5}
            >
              <Select.Viewport className="p-1">
                {devicePresets[deviceType].resolutions.map((resKey) => {
                  const item = resolutionPresets[resKey];
                  const localizedLabel = getResolutionLabel(resKey, t);
                  return (
                    <Select.Item
                      key={item.key}
                      value={item.key}
                      className="relative flex items-center px-3 py-2 rounded-md text-sm cursor-pointer select-none outline-none data-[highlighted]:bg-blue-50 dark:data-[highlighted]:bg-blue-900/20 data-[highlighted]:text-blue-700 dark:data-[highlighted]:text-blue-300 data-[state=checked]:bg-blue-50 dark:data-[state=checked]:bg-blue-900/20 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-blue-300 transition-colors duration-150"
                    >
                      <Select.ItemText>{localizedLabel}</Select.ItemText>
                      <Select.ItemIndicator className="absolute right-2">
                        <Check size={14} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  );
                })}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  );
};
