import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../'),
        'next/navigation': path.resolve(__dirname, './src/lib/next-compat.tsx'),
        'next/link': path.resolve(__dirname, './src/lib/next-compat.tsx'),
        '@/lib/supabase/client': path.resolve(__dirname, './src/lib/supabase.ts'),
      },
    },
    define: {
      'process.env': {
        NEXT_PUBLIC_SUPABASE_URL: env.VITE_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_RESTAURANT_ID: env.VITE_RESTAURANT_ID,
      },
    },
    base: './',
    build: {
      outDir: 'dist',
    },
  };
});
