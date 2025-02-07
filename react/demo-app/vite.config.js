import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Ensure local development works with the library
      'cutoff-audiokit': resolve(__dirname, '../library/src')
    }
  }
});