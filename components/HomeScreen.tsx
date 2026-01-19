
import React, { useState, useRef } from 'react';
import { Task } from '../types';

interface HomeScreenProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onDateDoubleClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMonthChange: (offset: number) => void;
  onOpenSettings: () => void;
  tasks: Task[];
  onOpenAI: () => void;
  isDarkMode: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  selectedDate, 
  onDateSelect, 
  onDateDoubleClick, 
  onTaskClick,
  onToggleTask,
  onDeleteTask,
  onMonthChange,
  onOpenSettings,
  tasks, 
  onOpenAI,
  isDarkMode
}) => {
  const today = new Date();
  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  
  // Swipe State
  const [swipeData, setSwipeData] = useState<{ id: string | null; offset: number }>({ id: null, offset: 0 });
  const startX = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const swipeThreshold = 80;

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysCount = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  const daysArr = [];
  for (let i = 0; i < startOffset; i++) daysArr.push(null);
  for (let i = 1; i <= daysCount; i++) daysArr.push(i);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.date === selectedDateStr);

  /**
   * 增强版节日识别系统
   * 包含全量公历与 2024-2026 农历映射
   */
  const getHolidayLabel = (y: number, m: number, d: number) => {
    const mmdd = `${m + 1}-${d}`;
    
    // 1. 公历固定节日
    const solarHolidays: Record<string, { name: string, type: 'MAJOR' | 'NORMAL' }> = {
      '1-1': { name: '元旦', type: 'MAJOR' },
      '2-14': { name: '情人节', type: 'NORMAL' },
      '3-8': { name: '妇女节', type: 'NORMAL' },
      '3-12': { name: '植树节', type: 'NORMAL' },
      '4-1': { name: '愚人节', type: 'NORMAL' },
      '5-1': { name: '劳动节', type: 'MAJOR' },
      '5-4': { name: '青年节', type: 'NORMAL' },
      '6-1': { name: '儿童节', type: 'NORMAL' },
      '8-1': { name: '建军节', type: 'NORMAL' },
      '9-10': { name: '教师节', type: 'NORMAL' },
      '10-1': { name: '国庆节', type: 'MAJOR' },
      '10-24': { name: '程序员节', type: 'NORMAL' },
      '10-31': { name: '万圣节', type: 'NORMAL' },
      '11-11': { name: '双十一', type: 'NORMAL' },
      '12-24': { name: '平安夜', type: 'NORMAL' },
      '12-25': { name: '圣诞节', type: 'NORMAL' }
    };

    // 2. 农历节日手动适配 (针对 2024-2026)
    const lunarMapping: Record<number, Record<string, { name: string, type: 'MAJOR' | 'TRADITION' }>> = {
      2024: {
        '2-9': { name: '除夕', type: 'MAJOR' },
        '2-10': { name: '春节', type: 'MAJOR' },
        '2-24': { name: '元宵', type: 'TRADITION' },
        '4-4': { name: '清明', type: 'MAJOR' },
        '6-10': { name: '端午', type: 'MAJOR' },
        '8-10': { name: '七夕', type: 'TRADITION' },
        '9-17': { name: '中秋', type: 'MAJOR' },
        '10-11': { name: '重阳', type: 'TRADITION' },
        '1-18': { name: '腊八', type: 'TRADITION' }
      },
      2025: {
        '1-28': { name: '除夕', type: 'MAJOR' },
        '1-29': { name: '春节', type: 'MAJOR' },
        '2-12': { name: '元宵', type: 'TRADITION' },
        '4-4': { name: '清明', type: 'MAJOR' },
        '5-31': { name: '端午', type: 'MAJOR' },
        '8-29': { name: '七夕', type: 'TRADITION' },
        '10-6': { name: '中秋', type: 'MAJOR' },
        '10-29': { name: '重阳', type: 'TRADITION' },
        '12-27': { name: '腊八', type: 'TRADITION' }
      },
      2026: {
        '2-16': { name: '除夕', type: 'MAJOR' },
        '2-17': { name: '春节', type: 'MAJOR' },
        '3-3': { name: '元宵', type: 'TRADITION' },
        '4-5': { name: '清明', type: 'MAJOR' },
        '6-19': { name: '端午', type: 'MAJOR' },
        '8-19': { name: '七夕', type: 'TRADITION' },
        '9-25': { name: '中秋', type: 'MAJOR' },
        '10-18': { name: '重阳', type: 'TRADITION' }
      }
    };

    // 优先匹配农历
    if (lunarMapping[y] && lunarMapping[y][mmdd]) {
      return lunarMapping[y][mmdd];
    }

    // 其次匹配公历
    if (solarHolidays[mmdd]) {
      return solarHolidays[mmdd];
    }

    return null;
  };

  const getRelativeTitle = () => {
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const selectedZero = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
    const diffDays = Math.round((selectedZero - todayZero) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "今日概览";
    if (diffDays === 1) return "明日概览";
    if (diffDays === -1) return "昨日概览";
    if (diffDays === 2) return "后天概览";
    if (diffDays === -2) return "前天概览";
    
    return `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 概览`;
  };

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    startX.current = e.touches[0].clientX;
    isSwiping.current = true;
    setSwipeData({ id: taskId, offset: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX.current;
    
    const task = todaysTasks.find(t => t.id === swipeData.id);
    const effectiveDiffX = (task?.completed && diffX < 0) ? 0 : diffX;
    
    setSwipeData(prev => ({ ...prev, offset: effectiveDiffX }));
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current || !swipeData.id) return;
    
    const task = todaysTasks.find(t => t.id === swipeData.id);
    
    if (swipeData.offset <= -swipeThreshold && !task?.completed) {
      onToggleTask(swipeData.id);
    } else if (swipeData.offset >= swipeThreshold) {
      if (confirm('确定要删除此任务吗？')) {
        onDeleteTask(swipeData.id);
      }
    }
    setSwipeData({ id: null, offset: 0 });
    isSwiping.current = false;
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <button onClick={() => onMonthChange(-1)} className={`p-2 rounded-xl shadow-sm text-[#2E5B88] transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center px-2">
            <h1 className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#2E5B88]'}`}>{year}年 {monthNames[month]}</h1>
            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">Smart Planner</p>
          </div>
          <button onClick={() => onMonthChange(1)} className={`p-2 rounded-xl shadow-sm text-[#2E5B88] transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <button onClick={onOpenSettings} className={`p-2 rounded-xl shadow-sm transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-white'}`}>
          <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-7 text-center mb-4">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => <span key={d} className="text-xs font-semibold text-gray-400">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-4">
          {daysArr.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const dateObj = new Date(year, month, day);
            const dateISO = dateObj.toISOString().split('T')[0];
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const holiday = getHolidayLabel(year, month, day);

            return (
              <div key={day} onClick={() => onDateSelect(dateObj)} onDoubleClick={() => onDateDoubleClick(dateObj)} className="flex flex-col items-center justify-start cursor-pointer select-none min-h-[58px] relative">
                <div className={`w-10 h-10 flex flex-col items-center justify-center rounded-full transition-all relative ${isSelected ? 'bg-[#2E5B88] text-white shadow-lg scale-110' : (isDarkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-gray-100 text-gray-900')} ${isToday && !isSelected ? 'ring-2 ring-[#2E5B88] ring-inset ring-opacity-50' : ''}`}>
                  <span className={`text-sm font-bold ${holiday ? '-mt-1' : ''}`}>{day}</span>
                  {holiday && (
                    <span className={`text-[8px] font-black leading-none mt-0.5 px-0.5 rounded transition-colors
                      ${holiday.type === 'MAJOR' 
                        ? (isSelected ? 'text-white' : 'text-red-600') 
                        : holiday.type === 'TRADITION' 
                          ? (isSelected ? 'text-white' : 'text-[#2E5B88]') 
                          : (isSelected ? 'text-white/70' : 'text-gray-400')
                      }
                    `}>
                      {holiday.name}
                    </span>
                  )}
                  {tasks.some(t => t.date === dateISO) && (
                    <div className={`w-1 h-1 rounded-full absolute ${holiday ? '-bottom-1.5' : 'bottom-1.5'} ${isSelected ? 'bg-white' : 'bg-[#2E5B88]'}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`flex-1 rounded-t-[32px] -mx-6 px-6 pt-8 overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
        <div className="w-12 h-1 bg-gray-200/20 rounded-full mx-auto mb-6" />
        <div className="flex items-baseline gap-2 mb-6">
          <h2 className={`text-2xl font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{getRelativeTitle()}</h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preview</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 space-y-4">
          {todaysTasks.length > 0 ? (
            <div className="space-y-4">
              {todaysTasks.map(task => (
                <div key={task.id} className="relative overflow-hidden rounded-[20px]">
                  <div className={`absolute inset-0 bg-red-500 flex items-center justify-start px-8 transition-opacity ${swipeData.id === task.id && swipeData.offset > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </div>
                  {!task.completed && (
                    <div className={`absolute inset-0 bg-[#FFD54F] flex items-center justify-end px-8 transition-opacity ${swipeData.id === task.id && swipeData.offset < 0 ? 'opacity-100' : 'opacity-0'}`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}

                  <div 
                    onClick={() => onTaskClick(task)} onTouchStart={(e) => handleTouchStart(e, task.id)} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
                    style={{ transform: swipeData.id === task.id ? `translateX(${swipeData.offset}px)` : 'translateX(0px)' }}
                    className={`relative z-10 flex items-center gap-5 p-5 rounded-[20px] group border-l-[6px] transition-all cursor-pointer select-none active:scale-[0.98] ${isDarkMode ? 'bg-white/5' : 'bg-[#F7F9FC]'} ${task.isUrgent && !task.completed ? 'border-red-500' : 'border-transparent'} ${task.completed ? 'opacity-50' : ''}`}
                  >
                    <div className={`text-xs font-bold text-[#2E5B88] w-16 text-center leading-tight p-2 rounded-xl shadow-sm transition-colors ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white'}`}>
                      {task.time.includes('-') ? task.time.split('-').map((t, i) => <div key={i} className={i === 1 ? "mt-0.5 opacity-40 text-[9px]" : ""}>{t.trim()}</div>) : task.time}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {task.isUrgent && !task.completed && <span className="text-[9px] text-red-500 font-black">!</span>}
                        <h4 className={`text-sm font-bold tracking-tight transition-all duration-300 ${task.completed ? 'text-gray-500 line-through' : (isDarkMode ? 'text-white/90' : 'text-gray-800')}`}>{task.title}</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{task.description}</p>
                    </div>
                    {task.completed && (
                      <div className="w-6 h-6 bg-[#FFD54F] rounded-full flex items-center justify-center shadow-sm animate-check-bounce">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 text-center px-4">
              <p className="font-bold mb-1">暂无任务安排</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
