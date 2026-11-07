import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'

/**
 * 两种用途：
 *   pnpm dev    —— 组件 gallery（gallery/ 下的展示页，不影响发布产物）
 *   pnpm build  —— 组件库（ESM + 类型声明 + 一份独立 CSS）
 *
 * gallery 是**开发期**的东西：它引用 src/ 源码而不是 dist/，
 * 所以改组件立刻能在浏览器里看到效果，不必先 build 再 install。
 */
export default defineConfig(({ command }) => {
  const isServe = command === 'serve'

  return {
    plugins: [
      vue(),
      // gallery 里的示例图标：Material Symbols 编译成内联 SVG，不请求网络
      Icons({ compiler: 'vue3', scale: 1, defaultClass: 'md-icon-svg' }),
      // 只在构建库时生成声明；gallery 不需要
      ...(isServe
        ? []
        : [
            dts({
              tsconfigPath: './tsconfig.json',
              include: ['src/**/*.ts', 'src/**/*.vue'],
            }),
          ]),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    ...(isServe
      ? {
          root: fileURLToPath(new URL('./gallery', import.meta.url)),
          server: { port: 5180, open: false },
          build: { outDir: fileURLToPath(new URL('./gallery-dist', import.meta.url)), emptyOutDir: true },
        }
      : {
          build: {
            outDir: 'dist',
            emptyOutDir: true,
            lib: {
              entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
              name: 'ClouderyM3Ui',
              formats: ['es'],
              fileName: () => 'index.js',
              cssFileName: 'm3-ui',
            },
            rollupOptions: {
              // vue 由使用方提供
              external: ['vue'],
              output: {
                assetFileNames: (asset) =>
                  asset.names?.some((name) => name.endsWith('.css')) || asset.name?.endsWith('.css')
                    ? 'm3-ui.css'
                    : 'assets/[name]-[hash][extname]',
              },
            },
          },
        }),
  }
})
