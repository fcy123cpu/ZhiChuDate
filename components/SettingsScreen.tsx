
import React, { useState } from 'react';
import { RINGTONE_CONFIG } from '../App';

interface SettingsScreenProps {
  onBack: () => void;
  currentWallpaper: string | null;
  onWallpaperChange: (url: string | null) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  totalTasks?: number;
  onClearMemory?: () => void;
  selectedRingtone: string;
  onRingtoneChange: (id: string) => void;
  nickname: string;
  avatar: string;
  onNavigateAccount: () => void;
  qiangguoEnabled?: boolean;
  onToggleQiangguo?: () => void;
  qiangguoTime?: string;
  onQiangguoTimeChange?: (val: string) => void;
}

const PRESET_WALLPAPERS = [
  { id: 'none', label: '默认简约', url: null, color: '#F7F9FC' },
  { id: 'ocean', label: '深邃海洋', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&q=80&w=800' },
  { id: 'sunset', label: '落日余晖', url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&q=80&w=800' },
  { id: 'forest', label: '森林秘境', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800' },
  { id: 'abstract', label: '艺术抽象', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800' },
  { id: 'night', label: '寂静星空', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=800' },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  onBack, 
  currentWallpaper, 
  onWallpaperChange, 
  isDarkMode, 
  setIsDarkMode,
  notificationsEnabled,
  onToggleNotifications,
  totalTasks = 0,
  onClearMemory,
  selectedRingtone,
  onRingtoneChange,
  nickname,
  avatar,
  onNavigateAccount,
  qiangguoEnabled = false,
  onToggleQiangguo,
  qiangguoTime = '08:00',
  onQiangguoTimeChange
}) => {
  const [activeSubView, setActiveSubView] = useState<'MAIN' | 'WALLPAPER' | 'RINGTONE'>('MAIN');

  const cardBaseClass = isDarkMode ? 'bg-[#1C1C1E]/90' : 'bg-white/80';
  const textTitleClass = isDarkMode ? 'text-white' : 'text-gray-800';

  const handleRingtoneSelect = (id: string, url: string) => {
    onRingtoneChange(id);
    const audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    audio.play().catch(e => console.warn("预览受阻:", e));
  };

  if (activeSubView === 'RINGTONE') {
    return (
      <div className="flex-1 flex flex-col bg-transparent animate-in slide-in-from-right duration-300">
        <div className="bg-[#2E5B88] text-white pt-12 pb-6 px-6 rounded-b-[32px] shadow-lg">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveSubView('MAIN')} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-2xl font-bold">提示铃声</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {Object.entries(RINGTONE_CONFIG).map(([id, config]) => (
            <button 
              key={id} 
              onClick={() => handleRingtoneSelect(id, config.url)}
              className={`w-full p-5 rounded-[24px] flex items-center justify-between transition-all ${selectedRingtone === id ? 'bg-[#2E5B88] text-white shadow-lg' : (isDarkMode ? 'bg-white/5 text-white/70' : 'bg-white text-gray-700 shadow-sm')}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedRingtone === id ? 'bg-white/20' : 'bg-[#2E5B88]/10'}`}>
                  <svg className={`w-4 h-4 ${selectedRingtone === id ? 'text-white' : 'text-[#2E5B88]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </div>
                <span className="font-bold text-sm">{config.label}</span>
              </div>
              {selectedRingtone === id && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubView === 'WALLPAPER') {
    return (
      <div className="flex-1 flex flex-col bg-transparent animate-in slide-in-from-right duration-300">
        <div className="bg-[#2E5B88] text-white pt-12 pb-6 px-6 rounded-b-[32px] shadow-lg">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveSubView('MAIN')} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-2xl font-bold">主题背景</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {PRESET_WALLPAPERS.map(wp => (
              <div 
                key={wp.id} 
                onClick={() => onWallpaperChange(wp.url)}
                className={`aspect-[4/5] rounded-[24px] overflow-hidden relative border-4 transition-all cursor-pointer ${currentWallpaper === wp.url ? 'border-[#2E5B88] scale-[1.02] shadow-lg' : 'border-transparent opacity-80'}`}
              >
                {wp.url ? (
                  <img src={wp.url} className="w-full h-full object-cover" alt={wp.label} />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: wp.color }} />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-4 text-white text-[10px] font-bold uppercase tracking-wider">{wp.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-transparent animate-in slide-in-from-right duration-300">
      <div className="bg-[#2E5B88] text-white pt-12 pb-6 px-6 rounded-b-[32px] shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold">智楚date 设置</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* User Account Card */}
        <button 
          onClick={onNavigateAccount}
          className="w-full text-left p-6 bg-gradient-to-br from-[#2E5B88] to-[#1e3d5c] rounded-[28px] text-white shadow-xl flex items-center gap-5 active:scale-[0.97] transition-all group"
        >
          <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden shadow-inner bg-white/10 flex-shrink-0">
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold tracking-tight">{nickname}</h3>
              <div className="px-1.5 py-0.5 bg-[#FFD54F] text-[#2E5B88] rounded text-[8px] font-black uppercase tracking-tighter">PREMIUM</div>
            </div>
            <div className="flex items-center gap-1.5 opacity-70">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[10px] font-medium">本地数据已同步</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all group-hover:bg-white/10">
            <svg className="w-5 h-5 opacity-40 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-[#2E5B88]/30 uppercase tracking-[0.15em] ml-4">本地数据仓库</h4>
          <div className={`${cardBaseClass} backdrop-blur-sm rounded-[24px] shadow-sm p-5`}>
            <div className="flex justify-between items-center mb-4">
              <span className={`font-bold text-sm ${textTitleClass}`}>已存行程条数</span>
              <span className="text-xl font-black text-[#2E5B88]">{totalTasks}</span>
            </div>
            <button onClick={onClearMemory} className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 active:scale-95 transition-all">安全擦除本地数据</button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-[#2E5B88]/30 uppercase tracking-[0.15em] ml-4">系统偏好与提醒</h4>
          <div className={`${cardBaseClass} backdrop-blur-sm rounded-[24px] shadow-sm divide-y divide-gray-50/10`}>
             <button onClick={() => setActiveSubView('WALLPAPER')} className="w-full p-5 flex items-center justify-between text-left">
              <span className={`font-bold text-sm ${textTitleClass}`}>自定义主题背景</span>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button onClick={() => setActiveSubView('RINGTONE')} className="w-full p-5 flex items-center justify-between text-left">
              <span className={`font-bold text-sm ${textTitleClass}`}>自定义提示铃声</span>
              <span className="text-[10px] font-bold text-[#2E5B88] opacity-60">{RINGTONE_CONFIG[selectedRingtone]?.label || '清脆铃音'}</span>
            </button>
            
            <div className="p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className={`font-bold text-sm ${textTitleClass}`}>系统任务提醒</span>
                <span className="text-[10px] text-gray-400">开启后日程将准时弹出通知</span>
              </div>
              <button onClick={onToggleNotifications} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notificationsEnabled ? 'bg-[#2E5B88]' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {/* 学习强国提醒配置 */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`font-bold text-sm ${textTitleClass}`}>学习强国日常打卡</span>
                  <span className="text-[10px] text-gray-400">每天准时智能提醒学习进度</span>
                </div>
                <button 
                  onClick={onToggleQiangguo} 
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${qiangguoEnabled ? 'bg-[#2E5B88]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${qiangguoEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              {qiangguoEnabled && (
                <div className="flex items-center justify-between pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-xs font-medium text-gray-500">提醒时间点</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={qiangguoTime} 
                      onChange={(e) => onQiangguoTimeChange?.(e.target.value)}
                      className={`px-3 py-1.5 rounded-lg border-0 text-xs font-black transition-colors ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-[#2E5B88]'}`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 flex items-center justify-between">
              <span className={`font-bold text-sm ${textTitleClass}`}>沉浸深色模式</span>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isDarkMode ? 'bg-[#2E5B88]' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isDarkMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
