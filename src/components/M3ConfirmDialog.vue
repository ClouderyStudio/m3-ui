<script setup lang="ts">
/**
 * 确认对话框（`window.confirm` 的替代）。破坏性操作前用它，而不是原生 confirm：
 * 原生在 M3 界面里突兀，也承载不了多段说明（例如「停用后现有会话立刻失效」）。
 *
 * 用法：页面里放一个 `<M3ConfirmDialog ref="confirmRef" />`，然后
 *   const ok = await confirmRef.value?.ask({ title, body, danger: true })
 * 返回 true = 用户确认，false = 取消/关闭。
 */
import { ref } from 'vue'
import type { IconComponent } from '../icons'
import M3Button from './M3Button.vue'
import M3Dialog from './M3Dialog.vue'

export interface ConfirmOptions {
  title: string
  /** 正文；数组表示多段。 */
  body?: string | string[]
  confirmLabel?: string
  cancelLabel?: string
  /** 破坏性操作：确认按钮换成 error 配色。 */
  danger?: boolean
  /** 标题上方的图标。 */
  icon?: IconComponent | null
  /** 弹层宽度。 */
  size?: 'sm' | 'md' | 'lg'
}

const open = ref(false)
const options = ref<ConfirmOptions>({ title: '' })
let resolver: ((value: boolean) => void) | null = null

function ask(next: ConfirmOptions): Promise<boolean> {
  // 上一个还没关闭就又被调用时，先把前一个判成取消
  resolver?.(false)
  options.value = next
  open.value = true
  return new Promise<boolean>((resolve) => {
    resolver = resolve
  })
}

/** 由对话框的 actions / scrim 触发：结束本次询问并把结果交给 await 方。 */
function settle(value: boolean): void {
  open.value = false
  resolver?.(value)
  resolver = null
}

function paragraphs(): string[] {
  const body = options.value.body
  if (!body) return []
  return Array.isArray(body) ? body : [body]
}

defineExpose({ ask, settle })
</script>

<template>
  <M3Dialog
    :model-value="open"
    :title="options.title"
    :icon="options.icon ?? null"
    :size="options.size ?? 'md'"
    @update:model-value="settle(false)"
  >
    <div class="confirm__body">
      <p v-for="(text, index) in paragraphs()" :key="index" class="confirm__text">{{ text }}</p>
    </div>

    <template #actions>
      <M3Button variant="text" @click="settle(false)">{{ options.cancelLabel ?? '取消' }}</M3Button>
      <M3Button :danger="options.danger" @click="settle(true)">
        {{ options.confirmLabel ?? '确定' }}
      </M3Button>
    </template>
  </M3Dialog>
</template>

<style scoped>
.confirm__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.confirm__text {
  margin: 0;
  white-space: pre-line;
}
</style>
