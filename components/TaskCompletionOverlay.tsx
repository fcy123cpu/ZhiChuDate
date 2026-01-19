
import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';

interface TaskCompletionOverlayProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  isDarkMode: boolean;
}

const TaskCompletionOverlay: React.FC<TaskCompletionOverlayProps> = ({ task, onClose, onComplete, isDarkMode }) => {
  const [sliderPos, setSliderPos] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showSmile, setShowSmile] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startXRef = useRef(0);

  // 当任务改变或显示时重置状态
  useEffect(() => {
    if (task) {
      setSliderPos(0);
      setIsFinished(false);
      setShowSmile(false);
    }
  }, [task]);

  if (!task) return null;

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    startXRef.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    // 禁用回弹动画以获取即时反馈
    if (containerRef.current) containerRef.current.style.transition = 'none';
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !containerRef.current || isFinished) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const rect = containerRef.current.getBoundingClientRect();
    const trackWidth = rect.width - 64; // 减去滑块宽度和padding
    
    let diff = clientX - startXRef.current;
    let newPos = Math.max(0, Math.min(diff, trackWidth));
    
    setSliderPos(newPos);

    // 临界值检测
    if (newPos >= trackWidth * 0.98) {
      isDragging.current = false;
      setIsFinished(true);
      setSliderPos(trackWidth);
      
      // 执行完成逻辑并展示微笑
      setTimeout(() => {
        onComplete(task.id);
        setShowSmile(true);
      }, 300);
    }
  };

  const handleEnd = () => {
    if (isDragging.current && !isFinished) {
      isDragging.current = false;
      // 弹性回弹
      setSliderPos(0);
    }
  };

  // 微笑弹窗展示
  if (showSmile) {
    return (
      <div 
        className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-white/20 backdrop-blur-xl" />
        <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-500">
          <div className="w-32 h-32 bg-[#FFD54F] rounded-full shadow-[0_0_50px_rgba(255,213,79,0.5)] flex items-center justify-center mb-6 animate-bounce">
             {/* 极简微笑图标 */}
             <svg className="w-20 h-20 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h.01M6 10h.01M8 15s1.5 2 4 2 4-2 4-2" />
             </svg>
          </div>
          <h2 className="text-3xl font-black text-[#2E5B88] tracking-tight">太棒了！</h2>
          <p className="text-[#2E5B88]/60 font-bold mt-2 uppercase tracking-widest text-xs">任务已成功达成</p>
          <p className="mt-8 text-gray-400 text-[10px] font-medium animate-pulse">点击任意位置返回</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500" onClick={onClose} />
      
      <div 
        className={`relative w-full max-w-sm rounded-[40px] p-8 shadow-2xl transition-all animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#1C1C1E] text-white' : 'bg-white text-gray-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-[#2E5B88]/5'}`}>
            <svg className="w-8 h-8 text-[#2E5B88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-black mb-2 tracking-tight">{task.title}</h2>
          <div className="px-3 py-1 rounded-full bg-[#2E5B88]/10 text-[#2E5B88] text-[10px] font-black tracking-widest uppercase">
            {task.time}
          </div>
        </div>

        {/* 丝滑滑动组件 */}
        <div className="relative">
          <div 
            ref={containerRef}
            className={`h-16 rounded-full relative flex items-center px-2 overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          >
            {/* 文字引导 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${sliderPos > 40 ? 'opacity-0 translate-x-4' : 'opacity-30'}`}>
                右滑标记完成
              </span>
            </div>

            {/* 进度轨道阴影 */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-[#2E5B88] transition-all duration-100"
              style={{ 
                width: `${sliderPos + 32}px`, 
                opacity: 0.1 + (sliderPos / 200),
                willChange: 'width'
              }}
            />

            {/* 丝滑滑块按钮 */}
            <div 
              onMouseDown={handleStart}
              onTouchStart={handleStart}
              style={{ 
                transform: `translateX(${sliderPos}px)`,
                transition: isDragging.current ? 'none' : 'transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                willChange: 'transform'
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-10 transition-colors ${isFinished ? 'bg-green-500 scale-110' : 'bg-[#2E5B88] text-white'}`}
            >
              {isFinished ? (
                <svg className="w-6 h-6 animate-check-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default TaskCompletionOverlay;
