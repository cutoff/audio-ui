import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import {resolve} from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        dts({include: ['src']})
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: 'index'
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'classnames',
                'lodash'
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime'
                }
            }
        },
        sourcemap: true,
        cssCodeSplit: false
    }
});
