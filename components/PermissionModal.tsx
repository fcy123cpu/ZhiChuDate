
import React from 'react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
  title: string;
  description: string;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDarkMode,
  title,
  description
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      
      {/* 弹窗主体 */}
      <div className={`relative w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-500 ${isDarkMode ? 'bg-[#1C1C1E] text-white border border-white/5' : 'bg-white text-gray-900'}`}>
        <div className="flex flex-col items-center text-center">
          {/* 动画图标容器 */}
          <div className="w-20 h-20 bg-[#2E5B88]/10 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-[#2E5B88]/20 rounded-full animate-ping opacity-20" />
            <svg className="w-10 h-10 text-[#2E5B88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          <h3 className="text-xl font-black mb-3 tracking-tight">{title}</h3>
          <p className="text-sm leading-relaxed text-gray-400 mb-8 px-2">
            {description}
          </p>

          <div className="w-full space-y-3">
            <button 
              onClick={onConfirm}
              className="w-full py-4 bg-[#2E5B88] text-white rounded-2xl font-bold shadow-lg shadow-[#2E5B88]/20 active:scale-95 transition-all"
            >
              立即开启
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
