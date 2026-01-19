
import React, { useState, useRef, useMemo } from 'react';
import { Task } from '../types';

interface DetailScreenProps {
  date: Date;
  tasks: Task[];
  onBack: () => void;
  onToggleTask: (id: string) => void;
  onToggleUrgent: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const DetailScreen: React.FC<DetailScreenProps> = ({ 
  date, 
  tasks, 
  onBack, 
  onToggleTask, 
  onToggleUrgent,
  onEditTask, 
  onDeleteTask 
}) => {
  const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`;
  const sortedTasks = [...tasks].sort((a, b) => a.time.localeCompare(b.time));

  // --- 节日识别与简介引擎 ---
  const holidayInfo = useMemo(() => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const mmdd = `${m + 1}-${d}`;
    
    // 公历节日简介
    const solarHolidays: Record<string, { name: string, type: 'MAJOR' | 'NORMAL', desc: string }> = {
      '1-1': { name: '元旦', type: 'MAJOR', desc: '公历新年之始，象征着万象更新与新的希望。' },
      '2-14': { name: '情人节', type: 'NORMAL', desc: '表达爱意与浪漫的时刻，愿天下有情人终成眷属。' },
      '3-8': { name: '妇女节', type: 'NORMAL', desc: '致敬伟大的女性力量，祝愿每一个她都能自由绽放。' },
      '3-12': { name: '植树节', type: 'NORMAL', desc: '播种绿色，守护家园，为地球增添一份生机。' },
      '4-1': { name: '愚人节', type: 'NORMAL', desc: '幽默生活的小插曲，用笑声点亮平凡的一天。' },
      '5-1': { name: '劳动节', type: 'MAJOR', desc: '赞美劳动者的辛勤付出，用双手创造更美好的生活。' },
      '5-4': { name: '青年节', type: 'NORMAL', desc: '奋斗是青春最亮丽的底色，不负韶华，逐梦前行。' },
      '6-1': { name: '儿童节', type: 'NORMAL', desc: '童心未泯，快乐无忧，愿每个人都拥有一颗赤子之心。' },
      '8-1': { name: '建军节', type: 'NORMAL', desc: '致敬最可爱的人，感谢英雄们的守护与奉献。' },
      '9-10': { name: '教师节', type: 'NORMAL', desc: '感念师恩，点亮心灯，向辛勤的园丁们致以崇高敬意。' },
      '10-1': { name: '国庆节', type: 'MAJOR', desc: '神州大地同庆盛世，祝愿祖国繁荣昌盛，国泰民安。' },
      '10-24': { name: '程序员节', type: 'NORMAL', desc: '愿代码优雅无虫，逻辑缜密如诗，致敬改变世界的开发者。' },
      '12-25': { name: '圣诞节', type: 'NORMAL', desc: '感受冬日的温馨与祝福，分享爱与礼物的欢乐。' }
    };

    // 农历节日适配 (2024-2026)
    const lunarMapping: Record<number, Record<string, { name: string, type: 'MAJOR' | 'TRADITION', desc: string }>> = {
      2024: {
        '2-9': { name: '除夕', type: 'MAJOR', desc: '辞旧迎新，阖家团圆，共进丰盛年夜饭，守岁祈福。' },
        '2-10': { name: '春节', type: 'MAJOR', desc: '中华民族最隆重的传统佳节，爆竹声中岁除，春风送暖。' },
        '2-24': { name: '元宵', type: 'TRADITION', desc: '正月十五赏花灯、吃元宵，象征团圆美满，月圆人圆。' },
        '4-4': { name: '清明', type: 'MAJOR', desc: '慎终追远，缅怀先人，在万物复苏之际踏青折柳。' },
        '6-10': { name: '端午', type: 'MAJOR', desc: '粽叶飘香，龙舟竞渡，纪念屈原，承载深厚的家国情怀。' },
        '9-17': { name: '中秋', type: 'MAJOR', desc: '花好月圆，情满中秋，寄托了对亲人与家乡的无尽思念。' }
      },
      2025: {
        '1-28': { name: '除夕', type: 'MAJOR', desc: '爆竹声声辞旧岁，万家灯火映团圆。' },
        '1-29': { name: '春节', type: 'MAJOR', desc: '金蛇迎春，大地回暖，家家户户共庆华夏新年。' },
        '5-31': { name: '端午', type: 'MAJOR', desc: '艾草幽香，端阳祈福，愿岁岁长安，事事顺意。' },
        '10-6': { name: '中秋', type: 'MAJOR', desc: '婵娟共赏，千里同情，月下相聚，情暖人间。' }
      },
      2026: {
        '2-16': { name: '除夕', type: 'MAJOR', desc: '旧岁将辞，祈愿新篇，阖家围炉，共话家常。' },
        '2-17': { name: '春节', type: 'MAJOR', desc: '丙午马年启新程，龙马精神贺新春，万象更新。' },
        '4-5': { name: '清明', type: 'MAJOR', desc: '春风和煦，追思先贤，珍惜当下，拥抱美好生活。' },
        '6-19': { name: '端午', type: 'MAJOR', desc: '端阳避邪，兰汤沐浴，传承千年文化，共享端午安康。' },
        '9-25': { name: '中秋', type: 'MAJOR', desc: '明月高悬照归程，饼香四溢叙亲情，人月两圆。' }
      }
    };

    const res = (lunarMapping[y] && lunarMapping[y][mmdd]) || solarHolidays[mmdd] || null;
    return res;
  }, [date]);

  // --- 滑动逻辑 ---
  const [swipeData, setSwipeData] = useState<{ id: string | null; offset: number; isSticky: boolean }>({ id: null, offset: 0, isSticky: false });
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const swipeThreshold = 80;
  const maxRightOffset = 140;
  const maxLeftOffset = -140;

  const onTouchStart = (e: React.TouchEvent, taskId: string) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setSwipeData({ id: taskId, offset: 0, isSticky: false });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!swipeData.id) return;
    const task = sortedTasks.find(t => t.id === swipeData.id);
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipe.current === true) {
      if (e.cancelable) e.preventDefault();
      let clampedOffset = diffX;
      if (task?.completed && diffX > 0) {
        clampedOffset = 0;
      } else {
        clampedOffset = Math.max(maxLeftOffset, Math.min(diffX, maxRightOffset));
      }
      setSwipeData(prev => ({ ...prev, offset: clampedOffset }));
    }
  };

  const onTouchEnd = () => {
    if (swipeData.id) {
      const task = sortedTasks.find(t => t.id === swipeData.id);
      if (swipeData.offset >= swipeThreshold && !task?.completed) {
        onToggleTask(swipeData.id);
      } else if (swipeData.offset <= -swipeThreshold && !task?.completed) {
        onToggleUrgent(swipeData.id);
      }
      setSwipeData({ id: null, offset: 0, isSticky: false });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (confirm('确定要删除此任务吗？')) {
      onDeleteTask(taskId);
    }
  };

  const getReminderText = (mins: number) => {
    if (mins === 0) return '准时提醒';
    if (mins < 60) return `${mins} 分钟前提醒`;
    return `${mins / 60} 小时前提醒`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* 顶部 Header */}
      <div className="bg-[#2E5B88] text-white pt-12 pb-6 px-6 rounded-b-[32px] shadow-lg z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">{formattedDate} 日程</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-24">
        {/* 节日介绍卡片 */}
        {holidayInfo && (
          <div className={`mb-8 p-6 rounded-[32px] relative overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 ${holidayInfo.type === 'MAJOR' ? 'bg-red-50/80 border border-red-100' : 'bg-[#2E5B88]/5 border border-[#2E5B88]/10'}`}>
            <div className={`absolute top-0 right-0 p-4 opacity-5 ${holidayInfo.type === 'MAJOR' ? 'text-red-500' : 'text-[#2E5B88]'}`}>
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 12l11 10 11-10L12 2zm0 17.5L3.5 12 12 4.5 20.5 12 12 19.5z"/></svg>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${holidayInfo.type === 'MAJOR' ? 'bg-red-500 text-white' : 'bg-[#2E5B88] text-white'}`}>
                   {holidayInfo.type === 'MAJOR' ? '盛大节日' : '传统佳节'}
                </span>
                <h2 className={`text-xl font-black ${holidayInfo.type === 'MAJOR' ? 'text-red-600' : 'text-[#2E5B88]'}`}>
                  {holidayInfo.name}
                </h2>
              </div>
              <p className={`text-sm leading-relaxed font-medium ${holidayInfo.type === 'MAJOR' ? 'text-red-700/70' : 'text-gray-500'}`}>
                {holidayInfo.desc}
              </p>
            </div>
          </div>
        )}

        {sortedTasks.length > 0 ? (
          <div className="relative">
            <div className="absolute left-[2.4rem] top-2 bottom-2 w-[2px] dashed-line opacity-30" />
            
            <div className="space-y-10">
              {sortedTasks.map((task) => (
                <div key={task.id} className="flex gap-6 items-start relative z-10">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-[#2E5B88] mb-2 bg-[#F7F9FC] py-1 px-2 rounded-lg">
                      {task.time.split(' ')[0]}
                    </span>
                    <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all duration-300
                      ${task.completed ? 'bg-[#FFD54F]' : task.isUrgent ? 'bg-red-500 scale-110 shadow-red-200 shadow-md' : 'bg-[#2E5B88]'}
                    `}>
                      {task.completed ? (
                        <svg className="w-3 h-3 text-white animate-check-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : task.isUrgent ? (
                        <span className="text-[8px] text-white font-black">!</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex-1 relative overflow-hidden rounded-[24px] bg-[#F1F4F8]">
                    {!task.completed && (
                      <div 
                        className={`absolute inset-y-0 left-0 flex items-center px-8 transition-all duration-150 rounded-l-[24px] bg-green-500
                          ${swipeData.id === task.id && swipeData.offset > 0 ? 'opacity-100' : 'opacity-0'}
                        `}
                        style={{ width: `${Math.max(0, swipeData.id === task.id ? swipeData.offset : 0)}px` }}
                      >
                        <div className="flex flex-col items-center text-white whitespace-nowrap">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-[10px] font-black uppercase mt-1">标记完成</span>
                        </div>
                      </div>
                    )}

                    {!task.completed && (
                      <div 
                        className={`absolute inset-y-0 right-0 flex items-center justify-end px-8 transition-all duration-150 rounded-r-[24px]
                          ${task.isUrgent ? 'bg-gray-400' : 'bg-red-500'}
                          ${swipeData.id === task.id && swipeData.offset < 0 ? 'opacity-100' : 'opacity-0'}
                        `}
                        style={{ width: `${Math.max(0, swipeData.id === task.id ? -swipeData.offset : 0)}px` }}
                      >
                        <div className="flex flex-col items-center text-white whitespace-nowrap">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-[10px] font-black uppercase mt-1">
                            {task.isUrgent ? '普通任务' : '标记加急'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div 
                      onTouchStart={(e) => onTouchStart(e, task.id)}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                      onDoubleClick={() => !task.completed && onEditTask(task)}
                      style={{ 
                        transform: swipeData.id === task.id ? `translateX(${swipeData.offset}px)` : 'translateX(0px)',
                        transition: swipeData.id === task.id ? 'none' : 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
                      }}
                      className={`relative z-10 bg-white p-6 shadow-sm cursor-pointer border-l-[8px] rounded-[24px] transition-all
                        ${task.completed ? 'border-[#FFD54F] opacity-60 pointer-events-none' : task.isUrgent ? 'border-red-500 bg-red-50/20' : 'border-[#2E5B88]'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col pr-8">
                          {task.isUrgent && !task.completed && (
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              URGENT 加急
                            </span>
                          )}
                          <h3 className={`font-bold text-lg leading-tight transition-all duration-300 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {task.title}
                          </h3>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteClick(e, task.id)}
                          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors pointer-events-auto"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {task.reminderMinutes !== undefined && !task.completed && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#FFD54F] bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100 w-fit mb-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                          {getReminderText(task.reminderMinutes)}
                        </div>
                      )}

                      <p className={`text-sm leading-relaxed mb-4 transition-all duration-300 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                      
                      <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E5B88]/60">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{task.time}</span>
                        </div>
                        {!task.completed && (
                          <div className="flex items-center gap-1 text-[10px] font-black text-[#2E5B88]/30 uppercase tracking-widest">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>双击修改</span>
                          </div>
                        )}
                        {task.completed && (
                          <div className="text-[10px] font-black text-green-500/40 uppercase tracking-widest flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            <span>任务已达成</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-12 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-white rounded-[40px] shadow-sm flex items-center justify-center mb-6">
               <svg className="w-12 h-12 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xl font-bold text-gray-800 mb-2">今天真是轻松的一天</p>
            <p className="text-sm leading-relaxed text-gray-400">没有任何琐碎安排。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailScreen;
