
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Task } from '../types';

interface AccountDetailScreenProps {
  onBack: () => void;
  nickname: string;
  onNicknameChange: (name: string) => void;
  avatar: string;
  onAvatarChange: (url: string) => void;
  tasks: Task[];
  isDarkMode: boolean;
}

const AccountDetailScreen: React.FC<AccountDetailScreenProps> = ({
  onBack,
  nickname,
  onNicknameChange,
  avatar,
  onAvatarChange,
  tasks,
  isDarkMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(nickname);
  const [statMode, setStatMode] = useState<'DAILY' | 'CUMULATIVE'>('DAILY'); 

  /**
   * 精准日期生成器
   */
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const [todayISO, setTodayISO] = useState(getTodayISO());

  useEffect(() => {
    const timer = setInterval(() => {
      const freshISO = getTodayISO();
      if (freshISO !== todayISO) {
        setTodayISO(freshISO);
      }
    }, 1000); 
    return () => clearInterval(timer);
  }, [todayISO]);

  const stats = useMemo(() => {
    const relevantTasks = statMode === 'DAILY' 
      ? tasks.filter(t => t.date === todayISO)
      : tasks;

    const totalCount = relevantTasks.length;
    const completedCount = relevantTasks.filter(t => t.completed).length;
    const urgentCount = relevantTasks.filter(t => t.isUrgent).length;

    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const urgentRate = totalCount > 0 ? (urgentCount / totalCount) * 100 : 0;

    const dateParts = todayISO.split('-');
    const displayDate = `${dateParts[1]}月${dateParts[2]}日`;

    return {
      total: totalCount,
      completed: completedCount,
      completionRate,
      urgentRate,
      labelSuffix: statMode === 'DAILY' ? '今日' : '累计',
      displayDate: statMode === 'DAILY' ? displayDate : '自创建以来'
    };
  }, [tasks, statMode, todayISO]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 限制文件大小在 2MB 以内防止本地存储溢出
      if (file.size > 2 * 1024 * 1024) {
        alert('图片太大啦，请选择 2MB 以内的图片作为头像');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onAvatarChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onNicknameChange(tempName.trim());
      setIsEditingName(false);
    }
  };

  const CircularProgress = ({ percentage, color, label }: { percentage: number, color: string, label: string }) => {
    const shadowColor = color === '#2E5B88' ? 'rgba(46, 91, 136, 0.2)' : 'rgba(248, 113, 113, 0.2)';
    
    return (
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div 
          className="w-32 h-32 rounded-full relative flex items-center justify-center transition-all duration-700"
          style={{ 
            background: `conic-gradient(${color} ${percentage}%, ${isDarkMode ? '#2A2A2E' : '#F1F5F9'} 0)`,
            boxShadow: `0 10px 25px -5px ${shadowColor}`
          }}
        >
          <div className={`w-[85%] h-[85%] rounded-full flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
            <span className={`text-2xl font-black transition-all ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
              {Math.round(percentage)}%
            </span>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{label}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent animate-in slide-in-from-right duration-300">
      {/* 顶部背景与个人资料 */}
      <div className="bg-[#2E5B88] text-white pt-10 pb-16 px-6 rounded-b-[48px] shadow-xl relative z-20">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative group">
            {/* 头像显示区域 */}
            <div 
              onClick={handleAvatarClick}
              className="w-32 h-32 rounded-full border-[6px] border-white/20 shadow-2xl overflow-hidden cursor-pointer relative active:scale-95 transition-all duration-300 hover:border-white/40"
            >
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              
              {/* 悬停遮罩层 */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">更换头像</span>
              </div>
            </div>

            {/* 相机图标辅助按钮 */}
            <div 
              onClick={handleAvatarClick}
              className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#2E5B88] text-[#2E5B88] cursor-pointer active:scale-90 transition-transform z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="mt-8 flex items-center gap-2">
            {isEditingName ? (
              <input 
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="bg-white/20 border-b-2 border-white/60 text-center outline-none px-3 font-black text-2xl w-48 rounded-t-lg py-1"
              />
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                <h2 className="text-2xl font-black tracking-tight">{nickname}</h2>
                <svg className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
            )}
          </div>
          <span className="mt-2 text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Premium Elite</span>
        </div>
      </div>

      {/* 核心统计卡片 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 -mt-10 relative z-30 pb-32">
        <div className={`p-8 rounded-[44px] shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-[#1C1C1E] shadow-black/40 border border-white/5' : 'bg-white shadow-[#2E5B88]/10'}`}>
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-2 mb-2">
               <h3 className={`font-black text-[11px] uppercase tracking-[0.25em] ${isDarkMode ? 'text-white/30' : 'text-gray-300'}`}>
                日程执行概览
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-[#2E5B88]/40'}`}>
                {stats.displayDate}
              </span>
            </div>
            
            <div className={`flex p-1 rounded-full w-full max-w-[240px] mb-12 ${isDarkMode ? 'bg-white/5' : 'bg-[#F1F5F9]'}`}>
              <button 
                onClick={() => setStatMode('DAILY')}
                className={`flex-1 py-2.5 text-[11px] font-black rounded-full transition-all duration-300 ${statMode === 'DAILY' ? 'bg-[#2E5B88] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                每日统计
              </button>
              <button 
                onClick={() => setStatMode('CUMULATIVE')}
                className={`flex-1 py-2.5 text-[11px] font-black rounded-full transition-all duration-300 ${statMode === 'CUMULATIVE' ? 'bg-[#2E5B88] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                累计统计
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full">
              <CircularProgress 
                percentage={stats.completionRate} 
                color="#2E5B88" 
                label={`${stats.labelSuffix}完成率`} 
              />
              <CircularProgress 
                percentage={stats.urgentRate} 
                color="#F87171" 
                label={`${stats.labelSuffix}加急率`} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-12">
               <div className={`p-6 rounded-[32px] flex flex-col items-center transition-all ${isDarkMode ? 'bg-white/5' : 'bg-[#F8FAFC]'}`}>
                  <span className={`text-3xl font-black transition-all ${isDarkMode ? 'text-white' : 'text-[#2E5B88]'}`}>{stats.total}</span>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">总计行程</span>
               </div>
               <div className={`p-6 rounded-[32px] flex flex-col items-center transition-all ${isDarkMode ? 'bg-white/5' : 'bg-[#F8FAFC]'}`}>
                  <span className={`text-3xl font-black transition-all ${isDarkMode ? 'text-white' : 'text-[#2E5B88]'}`}>{stats.completed}</span>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">已达成</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailScreen;
