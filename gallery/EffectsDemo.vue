<script setup lang="ts">
import { ref } from 'vue'
import {
  M3Button,
  M3Card,
  useConfetti,
  useFireworks,
  useReactions,
  useScrollReveal,
} from '../src'

/**
 * 动效彩蛋：撒花、礼花、飘表情、滚动进场。
 *
 * 全部走共享画布与共享的 .md-reveal 样式，减少动态效果时自动降级：
 * 装饰性动效直接不做（礼花/撒花），滚动进场只是缩短行程（它承载「新内容出现」的信息）。
 */
const { fire: fireConfetti } = useConfetti()
const { start: startFireworks, stop: stopFireworks } = useFireworks()
const { react } = useReactions()

const listRef = ref<HTMLElement | null>(null)
useScrollReveal(
  () => (listRef.value ? [...listRef.value.children] : []),
  { effect: 'slide-left', distance: 32, stagger: 90, once: false, threshold: 0.2 },
)

const fireworksOn = ref(false)

function toggleFireworks(): void {
  fireworksOn.value = !fireworksOn.value
  if (fireworksOn.value) startFireworks({ duration: 4000, count: 3 })
  else stopFireworks()
}

const emojis = ['🎉', '👍', '❤️', '🔥', '✨']
</script>

<template>
  <div class="fx">
    <div class="fx__row">
      <M3Button variant="filled" @click="fireConfetti($event, { count: 120 })">撒花</M3Button>
      <M3Button variant="tonal" @click="fireConfetti({ from: 'top', duration: 2600, count: 90 })">
        顶部礼花雨（2.6s）
      </M3Button>
      <M3Button variant="outlined" :aria-pressed="fireworksOn" @click="toggleFireworks">
        {{ fireworksOn ? '停止礼花' : '放礼花（4s）' }}
      </M3Button>
    </div>

    <div class="fx__row">
      <span class="fx__label">飘表情：</span>
      <M3Button
        v-for="emoji in emojis"
        :key="emoji"
        variant="text"
        size="sm"
        :aria-label="'飘出 ' + emoji"
        @click="react($event, emoji, { count: emoji === '🎉' ? 5 : 1 })"
      >
        {{ emoji }}
      </M3Button>
    </div>

    <div ref="listRef" class="fx__grid">
      <M3Card v-for="index in 6" :key="index" variant="filled" class="fx__card">
        <p class="fx__card-title">卡片 {{ index }}</p>
        <p class="fx__card-text">离开视口再回来会重新进场（once: false）</p>
      </M3Card>
    </div>

    <p class="fx__note">
      系统开启「减少动态效果」时：撒花与礼花不再播放（纯装饰），滚动进场保留但缩短行程 ——
      后者承载「新内容出现」的信息，删掉会让页面像卡住。
    </p>
  </div>
</template>

<style scoped>
.fx {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: var(--md-ref-typeface-plain);
}

.fx__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.fx__label {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-large-size);
}

.fx__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.fx__card {
  min-height: 96px;
}

.fx__card-title {
  margin: 0 0 4px;
  font-size: var(--md-sys-typescale-title-small-size);
}

.fx__card-text {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.fx__note {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}
</style>
