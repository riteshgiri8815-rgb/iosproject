import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  RotateCcw, 
  Sun, 
  Moon, 
  Cross, 
  Shield, 
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface IOSDeviceFrameProps {
  children: React.ReactNode;
  activeTab: 'guide' | 'about';
  onTabChange: (tab: 'guide' | 'about') => void;
  onReset: () => void;
}

export const IOSDeviceFrame: React.FC<IOSDeviceFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  onReset,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Device Toolbar Controls */}
      <div className="flex items-center justify-between w-full max-w-[390px] mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-teal-400" />
          <span className="font-medium text-slate-200">iPhone 16 Pro Simulator</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to iOS Light Mode' : 'Switch to iOS Dark Mode'}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onReset}
            title="Reset Simulator State"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* iPhone Outer Hardware Frame */}
      <div
        className={`w-full max-w-[390px] h-[780px] rounded-[52px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-4 border-slate-700/80 bg-slate-800/90 relative flex flex-col transition-colors duration-200 ${
          isDarkMode ? 'dark' : ''
        }`}
      >
        {/* Hardware Side Buttons Aesthetics */}
        <div className="absolute -left-[7px] top-[115px] w-[3px] h-[26px] bg-slate-600 rounded-l-sm" /> {/* Action Button */}
        <div className="absolute -left-[7px] top-[155px] w-[3px] h-[48px] bg-slate-600 rounded-l-sm" /> {/* Vol Up */}
        <div className="absolute -left-[7px] top-[215px] w-[3px] h-[48px] bg-slate-600 rounded-l-sm" /> {/* Vol Down */}
        <div className="absolute -right-[7px] top-[170px] w-[3px] h-[72px] bg-slate-600 rounded-r-sm" /> {/* Power Button */}

        {/* Screen Bezel & Canvas */}
        <div className="w-full h-full rounded-[42px] bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col relative border border-slate-200/20 dark:border-slate-800">
          
          {/* iOS Status Bar */}
          <div className="w-full h-11 px-7 flex items-center justify-between text-slate-900 dark:text-white text-xs font-semibold z-30 pt-1 shrink-0">
            {/* Clock */}
            <span className="w-12 tracking-tight">{currentTime}</span>

            {/* Dynamic Island */}
            <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5 shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0a1b24]" />
              </div>
              <div className="w-2 h-2 rounded-full bg-teal-500/80 animate-pulse" />
            </div>

            {/* Status Icons: Cellular, Wifi, Battery */}
            <div className="flex items-center gap-1.5 w-12 justify-end">
              <div className="flex items-end gap-0.5 h-2.5">
                <div className="w-0.5 h-1 bg-current rounded-2xs" />
                <div className="w-0.5 h-1.5 bg-current rounded-2xs" />
                <div className="w-0.5 h-2 bg-current rounded-2xs" />
                <div className="w-0.5 h-2.5 bg-current rounded-2xs" />
              </div>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 fill-current" />
            </div>
          </div>

          {/* View Container */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {children}
          </div>

          {/* iOS Bottom Native TabBar */}
          <div className="w-full h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-8 flex items-center justify-around z-30 shrink-0 pb-3">
            <button
              onClick={() => onTabChange('guide')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === 'guide'
                  ? 'text-teal-600 dark:text-teal-400 font-semibold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <Cross className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Guide</span>
            </button>

            <button
              onClick={() => onTabChange('about')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === 'about'
                  ? 'text-teal-600 dark:text-teal-400 font-semibold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Safety & About</span>
            </button>
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/40 dark:bg-white/40 rounded-full z-40 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
