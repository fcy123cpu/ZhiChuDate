
import { Task } from '../types';

const DB_NAME = 'SmartScheduleAI_DB';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

/**
 * 核心本地数据库服务 (IndexedDB)
 * 确保所有用户数据仅存储在浏览器本地，不上传任何云端服务器
 */
class DatabaseService {
  private db: IDBDatabase | null = null;

  /**
   * 初始化本地数据库
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject('无法打开本地数据库');
      request.onsuccess = () => {
        this.db = request.result;
        console.log("本地数据库 IndexedDB 已就绪");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // 使用 id 作为主键，存储用户的所有安排
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * 从本地读取所有任务
   */
  async getAllTasks(): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');
      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('获取本地任务失败');
    });
  }

  /**
   * 保存或更新任务到本地
   */
  async saveTask(task: Task): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');
      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('本地保存失败');
    });
  }

  /**
   * 从本地删除任务
   */
  async deleteTask(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');
      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('本地删除失败');
    });
  }

  /**
   * 获取本地存储的任务总数
   */
  async countTasks(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');
      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('统计失败');
    });
  }

  /**
   * 彻底清空本地数据库（危险操作）
   */
  async clearAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');
      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject('清空失败');
    });
  }
}

export const dbService = new DatabaseService();
