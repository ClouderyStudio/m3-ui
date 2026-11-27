import { ref } from 'vue'

/**
 * 页面滚动锁（引用计数）。
 *
 * 两个容易踩的细节：
 *
 * 1. **滚动条宽度补偿**。把 body 设成 overflow:hidden 之后滚动条消失，
 *    视口一下宽了 15px，整页内容会「向右跳」一下 —— 打开对话框时最刺眼。
 *    这里把消失的那条滚动条用 padding-right 补回去，内容位置完全不动。
 * 2. **引用计数**。对话框里再开命令面板、末尾再叠一个抽屉，关闭顺序不一定
 *    与打开顺序相反；不计数的话先关的那次就会把滚动条还回来。
 */
let count = 0
let previousOverflow = ''
let previousPaddingRight = ''

/** 当前是否被锁住（组件里用来决定要不要显示「滚动到底」之类的提示）。 */
export const scrollLocked = ref(false)

function scrollbarWidth(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth)
}

export function lockScroll(): void {
  if (typeof document === 'undefined') return
  if (count === 0) {
    const width = scrollbarWidth()
    previousOverflow = document.body.style.overflow
    previousPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    // 只有真的存在滚动条时才补：用 scrollbar-gutter 或覆盖式滚动条时这里会是 0
    if (width > 0) {
      const current = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0
      document.body.style.paddingRight = current + width + 'px'
    }
  }
  count += 1
  scrollLocked.value = true
}

export function unlockScroll(): void {
  if (typeof document === 'undefined') return
  count = Math.max(0, count - 1)
  if (count > 0) return
  document.body.style.overflow = previousOverflow
  document.body.style.paddingRight = previousPaddingRight
  scrollLocked.value = false
}
