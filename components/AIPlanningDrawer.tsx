
import React, { useState, useEffect } from 'react';
import { generateSmartSchedule } from '../services/aiService';
import { Task } from '../types';

export type DrawerMode = 'CREATE' | 'EDIT' | 'COMPLETE';

interface AIPlanningDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  editingTask: Task | null;
  mode: DrawerMode;
  onTasksGenerated: (tasks: any[]) => void;
  onTaskUpdated: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  isDarkMode: boolean;
  taskHistory: Task[];
}

const AIPlanningDrawer: React.FC<AIPlanningDrawerProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  editingTask,
  mode,
  onTasksGenerated,
  onTaskUpdated,
  onDeleteTask,
  isDarkMode,
  taskHistory
}) => {
  const [activeTab, setActiveTab] = useState<'AI' | 'MANUAL'>('AI');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [manualTitle, setManualTitle] = useState('');
  const [manualStartTime, setManualStartTime] = useState('09:00');
  const [manualEndTime, setManualEndTime] = useState('10:00');
  const [manualDesc, setManualDesc] = useState('');
  const [manualUrgent, setManualUrgent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingTask && mode === 'EDIT') {
        setManualTitle(editingTask.title);
        setManualDesc(editingTask.description);
        setManualUrgent(!!editingTask.isUrgent);
        const times = editingTask.time.split(' - ');
        if (times.length === 2) {
          setManualStartTime(times[0]);
          setManualEndTime(times[1]);
        }
        setActiveTab('MANUAL');
      } else {
        setPrompt('');
        setManualTitle('');
        setActiveTab('AI');
      }
    }
  }, [editingTask, isOpen, mode]);

  const handleAISubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toLocaleDateString('zh-CN');
      const result = await generateSmartSchedule(prompt, dateStr, taskHistory);
      onTasksGenerated(result.tasks);
      onClose();
    } catch (error) {
      alert("豆包 AI 规划暂时无法响应，请重试。请检查 API Key 配置是否正确。");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualTitle.trim()) return;
    const taskData = {
      title: manualTitle,
      time: `${manualStartTime} - ${manualEndTime}`,
      description: manualDesc || '手动添加的任务',
      isUrgent: manualUrgent,
      completed: false
    };

    if (mode === 'EDIT' && editingTask) {
      onTaskUpdated({ ...editingTask, ...taskData });
    } else {
      onTasksGenerated([taskData]);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingTask) {
      if (confirm('确定要删除此项日程吗？')) {
        onDeleteTask(editingTask.id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-md mx-auto rounded-t-[32px] shadow-2xl p-8 pb-12 transition-all ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
        <div className="w-12 h-1 bg-gray-300/30 rounded-full mx-auto mb-8" />
        
        <div className="flex justify-between items-center mb-6">
           <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#2E5B88]'}`}>
            {mode === 'EDIT' ? '编辑任务' : '添加日程'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {mode === 'CREATE' && (
          <div className={`flex p-1 rounded-xl mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
            <button 
              onClick={() => setActiveTab('AI')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'AI' ? 'bg-white text-[#2E5B88] shadow-sm' : 'text-gray-500'}`}
            >
              AI 规划
            </button>
            <button 
              onClick={() => setActiveTab('MANUAL')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'MANUAL' ? 'bg-white text-[#2E5B88] shadow-sm' : 'text-gray-500'}`}
            >
              手动录入
            </button>
          </div>
        )}

        <div className="min-h-[280px]">
          {activeTab === 'AI' ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E5B88] animate-pulse"></span>
                  <span className="text-[10px] text-[#2E5B88] font-black uppercase tracking-widest">
                    AI 记忆已启用
                  </span>
                </div>
                {/* Updated model label to Doubao */}
                <span className="text-[10px] text-gray-400 font-medium">豆包 Doubao Pro</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="在此输入您的今日愿望或任务列表，豆包 AI 会基于您的历史规律为您智能排程..."
                className={`w-full h-36 rounded-2xl p-5 text-sm font-medium resize-none border border-transparent outline-none focus:ring-2 focus:ring-[#2E5B88]/20 transition-all ${isDarkMode ? 'bg-white/5 text-white placeholder-gray-600 focus:bg-white/10' : 'bg-gray-50 text-gray-800 focus:bg-white focus:border-gray-100'}`}
              />
              <button 
                onClick={handleAISubmit}
                disabled={!prompt.trim() || isLoading}
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${!prompt.trim() || isLoading ? 'bg-gray-200' : 'bg-[#2E5B88] hover:bg-[#254d75] shadow-[#2E5B88]/20'}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    正在智能规划...
                  </>
                ) : '✨ 智能生成'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input 
                type="text" 
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="任务名称" 
                className={`w-full p-4 rounded-xl font-bold outline-none border border-transparent focus:border-[#2E5B88]/30 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-gray-800 focus:bg-white'}`}
              />
              <div className="flex gap-4">
                <input type="time" value={manualStartTime} onChange={(e) => setManualStartTime(e.target.value)} className={`flex-1 p-4 rounded-xl outline-none border border-transparent focus:border-[#2E5B88]/30 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-gray-800'}`} />
                <input type="time" value={manualEndTime} onChange={(e) => setManualEndTime(e.target.value)} className={`flex-1 p-4 rounded-xl outline-none border border-transparent focus:border-[#2E5B88]/30 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-gray-800'}`} />
              </div>
              <textarea 
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                placeholder="任务描述（可选）" 
                className={`w-full h-24 p-4 rounded-xl outline-none resize-none border border-transparent focus:border-[#2E5B88]/30 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-gray-800 focus:bg-white'}`}
              />
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-bold text-gray-700">标记加急</span>
                <input type="checkbox" checked={manualUrgent} onChange={(e) => setManualUrgent(e.target.checked)} className="w-5 h-5 rounded accent-[#2E5B88]" />
              </div>
              
              <div className="flex gap-3 pt-4">
                {mode === 'EDIT' && (
                  <button 
                    onClick={handleDelete}
                    className="flex-1 py-4 rounded-2xl font-bold text-red-500 border-2 border-red-500/20 hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    删除
                  </button>
                )}
                <button 
                  onClick={handleManualSubmit}
                  disabled={!manualTitle.trim()}
                  className={`flex-[2] py-4 rounded-2xl font-bold text-white transition-all shadow-md active:scale-95 ${!manualTitle.trim() ? 'bg-gray-200 shadow-none' : 'bg-[#2E5B88] hover:bg-[#254d75] shadow-[#2E5B88]/20'}`}
                >
                  保存日程
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPlanningDrawer;
