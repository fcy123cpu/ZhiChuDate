
import React, { useState, useEffect, useRef } from 'react';
import { Task, ViewState } from './types';
import HomeScreen from './components/HomeScreen';
import DetailScreen from './components/DetailScreen';
import SettingsScreen from './components/SettingsScreen';
import AccountDetailScreen from './components/AccountDetailScreen';
import AIPlanningDrawer, { DrawerMode } from './components/AIPlanningDrawer';
import TaskCompletionOverlay from './components/TaskCompletionOverlay';
import PermissionModal from './components/PermissionModal';
import { dbService } from './services/dbService';

export const RINGTONE_CONFIG: Record<string, { label: string, url: string }> = {
  bell: { label: '清脆铃音', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  crystal: { label: '水晶敲击', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  nature: { label: '林间鸟语', url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' },
  chime: { label: '悠扬律动', url: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3' },
  bubble: { label: '轻快气泡', url: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3' }
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('CREATE');
  
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedRingtone, setSelectedRingtone] = useState<string>('bell');
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  // 用户档案状态
  const [nickname, setNickname] = useState<string>('智楚用户');
  const [avatar, setAvatar] = useState<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=Zhichu&backgroundColor=b6e3f4');

  // 学习强国提醒状态
  const [qiangguoEnabled, setQiangguoEnabled] = useState<boolean>(false);
  const [qiangguoTime, setQiangguoTime] = useState<string>('22:00');
  const lastQiangguoDateRef = useRef<string>(localStorage.getItem('last_qiangguo_notif_date') || '');

  // 权限弹窗状态
  const [permissionModal, setPermissionModal] = useState<{ isOpen: boolean; target: 'TASK' | 'QIANGGUO' | null }>({ 
    isOpen: false, 
    target: null 
  });

  /**
   * 核心：主动申请系统通知权限
   * 该函数会触发浏览器的原生权限请求弹窗
   */
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('当前环境不支持系统通知。');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      alert('通知权限已被拒绝。请在浏览器或系统设置中手动开启，否则无法接收提醒。');
      return false;
    }

    // 主动弹出系统权限申请
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('申请通知权限时发生错误:', error);
      return false;
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        await dbService.init();
        const storedTasks = await dbService.getAllTasks();
        setTasks(storedTasks);
      } catch (err) {
        console.error("本地数据库初始化失败:", err);
      }

      // 恢复状态
      const savedNotif = localStorage.getItem('notifications_enabled') === 'true';
      const savedQgEnabled = localStorage.getItem('qiangguo_enabled') === 'true';
      
      // 如果之前开启过且权限允许，则恢复开启状态
      if ('Notification' in window && Notification.permission === 'granted') {
        if (savedNotif) setNotificationsEnabled(true);
        if (savedQgEnabled) setQiangguoEnabled(true);
      }

      const savedRingtone = localStorage.getItem('selected_ringtone');
      if (savedRingtone && RINGTONE_CONFIG[savedRingtone]) {
        setSelectedRingtone(savedRingtone);
      }
      
      const savedNickname = localStorage.getItem('user_nickname');
      if (savedNickname) setNickname(savedNickname);
      
      const savedAvatar = localStorage.getItem('user_avatar');
      if (savedAvatar) setAvatar(savedAvatar);
      
      const savedQgTime = localStorage.getItem('qiangguo_time');
      if (savedQgTime) setQiangguoTime(savedQgTime);

      const savedDarkMode = localStorage.getItem('dark_mode');
      if (savedDarkMode === 'true') setIsDarkMode(true);

      const savedWallpaper = localStorage.getItem('app_wallpaper');
      if (savedWallpaper) setWallpaper(savedWallpaper);
    };
    initApp();
  }, []);

  // 数据持久化
  useEffect(() => { localStorage.setItem('user_nickname', nickname); }, [nickname]);
  useEffect(() => { localStorage.setItem('user_avatar', avatar); }, [avatar]);
  useEffect(() => { localStorage.setItem('qiangguo_enabled', String(qiangguoEnabled)); }, [qiangguoEnabled]);
  useEffect(() => { localStorage.setItem('qiangguo_time', qiangguoTime); }, [qiangguoTime]);
  useEffect(() => { localStorage.setItem('dark_mode', String(isDarkMode)); }, [isDarkMode]);
  useEffect(() => { if (wallpaper) localStorage.setItem('app_wallpaper', wallpaper); else localStorage.removeItem('app_wallpaper'); }, [wallpaper]);
  useEffect(() => { localStorage.setItem('notifications_enabled', String(notificationsEnabled)); }, [notificationsEnabled]);
  useEffect(() => { localStorage.setItem('selected_ringtone', selectedRingtone); }, [selectedRingtone]);

  // 全局提醒检测
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentHM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // 1. 日常任务系统提醒
      if (notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        tasks.forEach(task => {
          if (task.completed || task.date !== todayStr || notifiedTasksRef.current.has(task.id)) return;
          try {
            const startTimeStr = task.time.split(' - ')[0];
            const [hours, minutes] = startTimeStr.split(':').map(Number);
            const taskTime = new Date(now);
            taskTime.setHours(hours, minutes, 0, 0);
            
            const reminderMins = task.reminderMinutes || 0;
            const reminderTime = new Date(taskTime.getTime() - (reminderMins * 60000));
            
            if (now >= reminderTime && now < new Date(reminderTime.getTime() + 60000)) {
              new Notification(`智楚日程提醒: ${task.title}`, { 
                body: `${task.time}\n${task.description}`, 
                icon: avatar,
                tag: task.id 
              });
              const audio = new Audio(RINGTONE_CONFIG[selectedRingtone]?.url || RINGTONE_CONFIG['bell'].url);
              audio.crossOrigin = "anonymous";
              audio.play().catch(() => {});
              notifiedTasksRef.current.add(task.id);
            }
          } catch (e) {
            console.error("任务提醒解析错误:", e);
          }
        });
      }

      // 2. 学习强国提醒
      if (qiangguoEnabled && currentHM === qiangguoTime && lastQiangguoDateRef.current !== todayStr) {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification("学习强国提醒", { 
            body: "✨ 坚持每日学习打卡！学习强国的时间到了。", 
            icon: 'https://cdn-icons-png.flaticon.com/512/5948/5948565.png',
            tag: "qiangguo-reminder" 
          });
          const audio = new Audio(RINGTONE_CONFIG[selectedRingtone]?.url || RINGTONE_CONFIG['bell'].url);
          audio.crossOrigin = "anonymous";
          audio.play().catch(() => {});
          lastQiangguoDateRef.current = todayStr;
          localStorage.setItem('last_qiangguo_notif_date', todayStr);
        }
      }
    }, 20000); 
    return () => clearInterval(interval);
  }, [tasks, notificationsEnabled, selectedRingtone, qiangguoEnabled, qiangguoTime, avatar]);

  const onTasksGenerated = async (newGeneratedTasks: any[]) => {
    const newTasks: Task[] = newGeneratedTasks.map((gt, idx) => ({
      id: Date.now().toString() + idx,
      ...gt,
      completed: false,
      date: selectedDate.toISOString().split('T')[0]
    }));
    setTasks(prev => [...prev, ...newTasks]);
    await Promise.all(newTasks.map(t => dbService.saveTask(t)));
  };

  const updateTask = async (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    await dbService.saveTask(updatedTask);
    setEditingTask(null);
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      const updated = { ...task, completed: true };
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      await dbService.saveTask(updated);
    }
  };

  // 处理权限弹窗的确认
  const handlePermissionConfirm = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      if (permissionModal.target === 'TASK') setNotificationsEnabled(true);
      if (permissionModal.target === 'QIANGGUO') setQiangguoEnabled(true);
    }
    setPermissionModal({ isOpen: false, target: null });
  };

  return (
    <div className={`max-w-md mx-auto min-h-screen relative shadow-xl overflow-hidden flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-[#F7F9FC] text-gray-900'}`}>
      {wallpaper && (
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${wallpaper})` }}>
           <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-white/10'}`} />
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        {view === 'HOME' && (
          <HomeScreen 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate}
            onDateDoubleClick={(d) => { setSelectedDate(d); setView('DETAIL'); }}
            onTaskClick={(t) => !t.completed && setFocusedTask(t)}
            onToggleTask={toggleTask}
            onDeleteTask={async (id) => {
               setTasks(prev => prev.filter(t => t.id !== id));
               await dbService.deleteTask(id);
            }}
            onMonthChange={(offset) => {
              const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
              setSelectedDate(newDate);
            }}
            onOpenSettings={() => setView('SETTINGS')}
            tasks={tasks}
            onOpenAI={() => setDrawerMode('CREATE')}
            isDarkMode={isDarkMode}
          />
        )}
        {view === 'DETAIL' && (
          <DetailScreen 
            date={selectedDate} 
            tasks={tasks.filter(t => t.date === selectedDate.toISOString().split('T')[0])}
            onBack={() => setView('HOME')}
            onToggleTask={toggleTask}
            onToggleUrgent={async (id) => {
              const task = tasks.find(t => t.id === id);
              if (task && !task.completed) {
                const updated = { ...task, isUrgent: !task.isUrgent };
                setTasks(prev => prev.map(t => t.id === id ? updated : t));
                await dbService.saveTask(updated);
              }
            }}
            onEditTask={(t) => { if(!t.completed) { setEditingTask(t); setDrawerMode('EDIT'); setIsDrawerOpen(true); } }}
            onDeleteTask={async (id) => {
               setTasks(prev => prev.filter(t => t.id !== id));
               await dbService.deleteTask(id);
            }}
          />
        )}
        {view === 'SETTINGS' && (
          <SettingsScreen 
            onBack={() => setView('HOME')} 
            currentWallpaper={wallpaper}
            onWallpaperChange={setWallpaper}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={async () => {
              if (notificationsEnabled) {
                setNotificationsEnabled(false);
              } else {
                // 如果未授权，先调起软件层面的引导弹窗
                if (Notification.permission === 'default') {
                  setPermissionModal({ isOpen: true, target: 'TASK' });
                } else {
                  const granted = await requestNotificationPermission();
                  if (granted) setNotificationsEnabled(true);
                }
              }
            }}
            totalTasks={tasks.length}
            onClearMemory={async () => { if(confirm('清空所有本地数据？')){ await dbService.clearAll(); setTasks([]); } }}
            selectedRingtone={selectedRingtone}
            onRingtoneChange={setSelectedRingtone}
            nickname={nickname}
            avatar={avatar}
            onNavigateAccount={() => setView('ACCOUNT_DETAIL')}
            qiangguoEnabled={qiangguoEnabled}
            onToggleQiangguo={async () => {
              if (qiangguoEnabled) {
                setQiangguoEnabled(false);
              } else {
                // 如果未授权，先调起软件层面的引导弹窗
                if (Notification.permission === 'default') {
                  setPermissionModal({ isOpen: true, target: 'QIANGGUO' });
                } else {
                  const granted = await requestNotificationPermission();
                  if (granted) setQiangguoEnabled(true);
                }
              }
            }}
            qiangguoTime={qiangguoTime}
            onQiangguoTimeChange={setQiangguoTime}
          />
        )}
        {view === 'ACCOUNT_DETAIL' && (
          <AccountDetailScreen 
            onBack={() => setView('SETTINGS')}
            nickname={nickname}
            onNicknameChange={setNickname}
            avatar={avatar}
            onAvatarChange={setAvatar}
            tasks={tasks}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {view === 'HOME' && (
        <button 
          onClick={() => { setEditingTask(null); setDrawerMode('CREATE'); setIsDrawerOpen(true); }}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#2E5B88] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
      )}

      {/* 权限引导弹窗 */}
      <PermissionModal 
        isOpen={permissionModal.isOpen}
        onClose={() => setPermissionModal({ isOpen: false, target: null })}
        onConfirm={handlePermissionConfirm}
        isDarkMode={isDarkMode}
        title="开启通知权限"
        description={permissionModal.target === 'QIANGGUO' 
          ? "开启后，智楚将在您设定的时间点提醒您进行学习强国打卡，助您保持学习习惯。"
          : "开启后，系统将在任务开始前精准推送提醒，确保您不会错过任何重要的日程安排。"
        }
      />

      <AIPlanningDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        selectedDate={selectedDate}
        editingTask={editingTask}
        mode={drawerMode}
        onTasksGenerated={onTasksGenerated}
        onTaskUpdated={updateTask}
        onDeleteTask={async (id) => { setTasks(prev => prev.filter(t => t.id !== id)); await dbService.deleteTask(id); }}
        isDarkMode={isDarkMode}
        taskHistory={tasks}
      />

      <TaskCompletionOverlay 
        task={focusedTask}
        onClose={() => setFocusedTask(null)}
        onComplete={toggleTask}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;
