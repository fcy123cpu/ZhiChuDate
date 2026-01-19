
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    // 关键修改：设置为相对路径，确保在 Android/iOS 容器中能正确加载本地资源
    base: './', 
    plugins: [react()],
    define: {
      'process.env': env
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  };
});
