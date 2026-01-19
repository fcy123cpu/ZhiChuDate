
export interface Task {
  id: string;
  time: string;
  title: string;
  description: string;
  completed: boolean;
  date: string; // ISO format
  reminderMinutes?: number; // Minutes before the event time
  isUrgent?: boolean; // 新增：是否加急
}

export type ViewState = 'HOME' | 'DETAIL' | 'SETTINGS' | 'ACCOUNT_DETAIL';

export interface AIResponse {
  tasks: Array<{
    time: string;
    title: string;
    description: string;
    reminderMinutes?: number;
    isUrgent?: boolean;
  }>;
}
