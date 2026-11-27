<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { IconCheck, IconContentCopy } from '../icons'
import M3Button from './M3Button.vue'
import M3IconButton from './M3IconButton.vue'

type CopyVariant = 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text'

const props = withDefaults(
  defineProps<{
    /** Text copied to the clipboard. */
    text: string
    label?: string
    copiedLabel?: string
    /** Button emphasis. */
    variant?: CopyVariant
    size?: 'sm' | 'md' | 'lg'
    /** Render only the icon (with an accessible name). */
    iconOnly?: boolean
    /** How long the success state stays, in ms. */
    timeout?: number
    disabled?: boolean
  }>(),
  {
    label: '复制',
    copiedLabel: '已复制',
    variant: 'text',
    size: 'md',
    iconOnly: false,
    timeout: 1600,
    disabled: false,
  },
)

const emit = defineEmits<{ copied: [text: string]; error: [] }>()

const copied = ref(false)
let timer = 0

const icon = computed(() => (copied.value ? IconCheck : IconContentCopy))
const iconVariant = computed<'standard' | 'filled' | 'tonal' | 'outlined'>(() => {
  if (props.variant === 'text' || props.variant === 'elevated') return 'standard'
  return props.variant
})

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 落到下面的 execCommand 兜底（http 页面、旧版浏览器、权限被拒）
  }

  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  area.style.pointerEvents = 'none'
  document.body.appendChild(area)
  area.select()

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  area.remove()
  return ok
}

async function run(): Promise<void> {
  if (props.disabled) return
  const ok = await writeClipboard(props.text)
  if (!ok) {
    emit('error')
    return
  }

  copied.value = true
  emit('copied', props.text)
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    copied.value = false
  }, props.timeout)
}

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <M3IconButton
    v-if="iconOnly"
    :icon="icon"
    :label="copied ? copiedLabel : label"
    :variant="iconVariant"
    :size="size"
    :disabled="disabled"
    :class="{ 'is-copied': copied }"
    @click="run"
  />

  <M3Button
    v-else
    :icon="icon"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :class="{ 'is-copied': copied }"
    @click="run"
  >
    {{ copied ? copiedLabel : label }}
  </M3Button>
</template>

<style scoped>
/* 复制成功后图标短暂变成对勾；颜色由按钮自己的变体决定，这里只做轻微的弹出 */
.is-copied :deep(.md-icon) {
  animation: md-pop-in var(--md-sys-motion-duration-short4)
    var(--md-sys-motion-easing-emphasized-decelerate) both;
}

@media (prefers-reduced-motion: reduce) {
  .is-copied :deep(.md-icon) {
    animation: md-fade-in var(--md-sys-motion-duration-short3) linear both;
  }
}
</style>
