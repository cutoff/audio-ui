import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Ensure local development works with the library
      '@cutoff/audio-ui-react': resolve(__dirname, '../library/src')
    }
  }
});
