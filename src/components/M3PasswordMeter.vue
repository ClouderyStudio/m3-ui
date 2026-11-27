<script setup lang="ts">
import { computed, watch } from 'vue'

/**
 * 密码强度条。
 *
 * 评分只看「长度 + 字符种类」，不做字典/熵估算 —— 组件库不该假装自己能判断
 * 「Password123!」是不是弱密码，那是服务端或 zxcvbn 之类专门库的事。
 * 这里的分数（0-4）只用来给用户一个即时的方向感，并让父组件能拿它拦住提交。
 *
 * 五段条而不是一条连续进度：分段会让人数得清「还差一档」，
 * 连续条只能看出「大概六成」，两者传达的信息量不一样。
 */
type Tone = 'error' | 'tertiary' | 'primary'

const props = withDefaults(
  defineProps<{
    /** 要评分的密码原文。 */
    value: string
    /** 五档文案，弱 → 强。 */
    labels?: string[]
    /** 视为「够长」的字符数，+4 之后算「很长」。 */
    minLength?: number
    /** 显示档位文案（默认显示）。 */
    showLabel?: boolean
  }>(),
  {
    labels: () => ['太弱', '较弱', '一般', '良好', '很强'],
    minLength: 8,
    showLabel: true,
  },
)

const emit = defineEmits<{ score: [value: number] }>()

const hasValue = computed(() => props.value.length > 0)

function scorePassword(password: string, minLength: number): number {
  let score = 0
  if (password.length >= minLength) score++
  if (password.length >= minLength + 4) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

const score = computed(() => scorePassword(props.value, props.minLength))
/** 有值就至少点亮第一段 —— 一整排全灰看起来像组件坏了。 */
const filled = computed(() => (hasValue.value ? score.value + 1 : 0))

const tone = computed<Tone>(() => {
  if (score.value <= 1) return 'error'
  if (score.value === 2) return 'tertiary'
  return 'primary'
})

const label = computed(() => props.labels[score.value] ?? '')

watch(
  [() => props.value, score],
  () => emit('score', hasValue.value ? score.value : -1),
  { immediate: true },
)
</script>

<template>
  <div class="md-password-meter">
    <div
      class="md-password-meter__track"
      role="meter"
      aria-valuemin="0"
      aria-valuemax="4"
      :aria-valuenow="hasValue ? score : 0"
      :aria-valuetext="hasValue ? label : '未输入'"
      aria-label="密码强度"
    >
      <span
        v-for="index in 5"
        :key="index"
        class="md-password-meter__segment"
        :class="[
          'md-password-meter__segment--' + tone,
          { 'is-filled': index <= filled },
        ]"
      />
    </div>

    <p v-if="showLabel && hasValue" class="md-password-meter__label" :class="'md-password-meter__label--' + tone">
      {{ label }}
    </p>
  </div>
</template>

<style scoped>
.md-password-meter {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: var(--md-ref-typeface-plain);
}

.md-password-meter__track {
  display: flex;
  gap: 4px;
}

.md-password-meter__segment {
  flex: 1;
  height: 4px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-highest);
  transition:
    background-color var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
}

/* 点亮的段落稍微「胖」一点：1.06 的纵向拉伸在 4px 的条上不至于抖，但看得出层次 */
.md-password-meter__segment.is-filled {
  scale: 1 1.5;
}

.md-password-meter__segment--error.is-filled {
  background-color: var(--md-sys-color-error);
}
.md-password-meter__segment--tertiary.is-filled {
  background-color: var(--md-sys-color-tertiary);
}
.md-password-meter__segment--primary.is-filled {
  background-color: var(--md-sys-color-primary);
}

.md-password-meter__label {
  margin: 0;
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.md-password-meter__label--error {
  color: var(--md-sys-color-error);
}
.md-password-meter__label--tertiary {
  color: var(--md-sys-color-tertiary);
}
.md-password-meter__label--primary {
  color: var(--md-sys-color-primary);
}

@media (prefers-reduced-motion: reduce) {
  .md-password-meter__segment.is-filled {
    scale: 1 1.25;
  }
}
</style>
