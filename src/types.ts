import type { Component } from 'vue'

/**
 * 图标组件的形状。
 *
 * 只要求「是一个 Vue 组件并渲染出 <svg>」，不绑定任何图标库：
 * unplugin-icons 生成的函数式组件、手写的 SFC、nuxt-icon 之类都满足。
 *
 * 早先把它写成构造函数签名，结果 unplugin-icons 产出的
 * FunctionalComponent 一个都过不了类型检查 —— 这里直接用 Vue 自己的 Component。
 */
export type IconComponent = Component
