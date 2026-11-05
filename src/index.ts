/**
 * @cloudery/m3-ui 入口。
 *
 *   import { M3Button, M3Card } from '@cloudery/m3-ui'
 *   import '@cloudery/m3-ui/style.css'
 *
 * 样式入口包含结构令牌（shape / typescale / elevation / motion / state layer）
 * 与基础层，但**不含配色**：--md-sys-color-* 必须由使用方提供。
 */
import './styles/m3-foundations.css'
import './styles/base.css'
import './styles/motion.css'

export * from './components'
