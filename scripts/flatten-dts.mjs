/**
 * 构建后整理产物：
 *   dist/src/**  ->  dist/**
 *
 * vite-plugin-dts 在 lib 模式下会把声明按源码目录（src/）原样输出，
 * 而 index.js 在 dist 根。不摊平的话 package.json 的 types 路径要多一层 src/，
 * 使用方在 "types"/"import" 里也要写两套目录，容易错。
 */
import { cpSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
const nested = join(dist, 'src')

if (!existsSync(nested)) {
  console.log('[flatten-dts] dist/src 不存在，跳过')
  process.exit(0)
}

cpSync(nested, dist, { recursive: true })
rmSync(nested, { recursive: true, force: true })
console.log('[flatten-dts] 声明文件已摊平到 dist/')
