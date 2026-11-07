import { createApp } from 'vue'
import App from './App.vue'

import '../src/styles/m3-foundations.css'
// gallery 自带一份官方种子色：组件库本身**不**附带配色（由使用方注入），
// 这里引入是为了演示「同一套组件换配色」的效果。
import '../src/styles/m3-color-tokens.css'
import '../src/styles/base.css'
import '../src/styles/motion.css'
import './gallery.css'

createApp(App).mount('#app')
