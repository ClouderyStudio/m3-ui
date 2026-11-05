import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

/**
 * 组件库构建：输出 ESM + 类型声明 + 一份独立 CSS。
 *
 * 关键约定：
 *   - vue 是 peerDependency，不打包进去；
 *   - 样式单独产出 dist/m3-ui.css，由使用方显式 import，
 *     不做成 JS 里自动注入（SSR 与样式顺序都更难控）；
 *   - 类型用 vue-tsc 生成（见 package.json 的 build 脚本），
 *     Vite 只负责 JS 与 CSS。
 */
export default defineConfig({
  plugins: [
    vue(),
    // 产出 .d.ts；rollupTypes 会把所有声明合并成单个入口，使用方无需处理深层路径
    /*
     * 类型声明直接输出到 dist/ 根（entryRoot 会剥掉 src/ 前缀），
     * 和 index.js 同级，使用方解析 .d.ts 不需要知道内部目录结构。
     * 注意：不要开 rollupTypes —— 它会把 .vue 的类型全部丢掉，产出一个空的 index.d.ts。
     */
    dts({
      tsconfigPath: './tsconfig.json',
      include: ['src/**/*.ts', 'src/**/*.vue'],
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
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
})