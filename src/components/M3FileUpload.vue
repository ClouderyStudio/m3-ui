<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { IconComponent } from '../icons'
import { IconCheckCircle, IconClose, IconDescription, IconError, IconUpload } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'
import M3Progress from './M3Progress.vue'

/**
 * 拖拽上传区 + 文件列表。
 *
 * 它只负责「选文件、摆出来、显示进度」，真正上传由使用方做：
 * 拿到的条目是响应式对象，直接改 entry.status / entry.progress 就会反映到行上。
 * 把上传逻辑塞进组件里，等于替使用方决定用 fetch 还是 XHR、要不要断点续传。
 *
 * 预览图用 URL.createObjectURL，所以条目离场时必须 revoke ——
 * 否则一个长时间开着的后台页面会把每张图都钉在内存里。
 */
export interface UploadFile {
  file: File
  id: string
  /** 0-100；仅 status 为 uploading 时显示。 */
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  /** 图片类型自动生成的预览地址，组件会在条目移除时回收。 */
  preview?: string
}

const props = withDefaults(
  defineProps<{
    /** 受控文件列表；不传则由组件自己维护。 */
    modelValue?: UploadFile[]
    /** 接受的类型，逗号分隔（".png,image/*"）。 */
    accept?: string
    multiple?: boolean
    /** 单个文件上限（字节），超出的会被安静地丢掉。 */
    maxSize?: number
    disabled?: boolean
    /** 拖拽区主文案。 */
    dropText?: string
    /** 选择文件的操作文字。 */
    selectText?: string
    /** 上限说明的前缀。 */
    maxSizeLabel?: string
    /** 行内删除按钮的读屏名字。 */
    removeLabel?: string
    /** 拖拽区图标。 */
    icon?: IconComponent | null
  }>(),
  {
    modelValue: undefined,
    accept: '',
    multiple: false,
    maxSize: undefined,
    disabled: false,
    dropText: '把文件拖到这里，或',
    selectText: '点击选择',
    maxSizeLabel: '最大',
    removeLabel: '移除',
    icon: null,
  },
)

const emit = defineEmits<{
  'update:modelValue': [files: UploadFile[]]
  select: [files: UploadFile[]]
  remove: [file: UploadFile]
}>()

const internal = ref<UploadFile[]>([])
const controlled = computed(() => props.modelValue !== undefined)
const files = computed(() => (controlled.value ? props.modelValue! : internal.value))

function setFiles(next: UploadFile[]): void {
  if (!controlled.value) internal.value = next
  emit('update:modelValue', next)
}

/* 条目怎么离场的都要回收预览地址：点删除、清空、父组件直接 splice 都算 */
watch(
  () => files.value.slice(),
  (next, previous) => {
    const kept = new Set(next.map((entry) => entry.id))
    for (const entry of previous) {
      if (entry.preview && !kept.has(entry.id)) URL.revokeObjectURL(entry.preview)
    }
  },
)

onBeforeUnmount(() => {
  // 受控列表可能活得比组件久（父组件还拿着它），所以只回收自管的那份
  if (controlled.value) return
  for (const entry of internal.value) {
    if (entry.preview) URL.revokeObjectURL(entry.preview)
  }
})

const dragging = ref(false)
/** dragenter/dragleave 在子元素之间移动时会成对触发，用计数抵消，否则底色会闪。 */
let dragDepth = 0
const inputEl = ref<HTMLInputElement | null>(null)

const acceptList = computed(() =>
  props.accept ? props.accept.split(',').map((item) => item.trim()).filter(Boolean) : [],
)

function isAccepted(file: File): boolean {
  if (acceptList.value.length === 0) return true
  return acceptList.value.some((rule) => {
    if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule.toLowerCase())
    if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1))
    return file.type === rule
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

let fallbackId = 0

function nextId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  fallbackId += 1
  return 'file-' + fallbackId
}

function addFiles(list: FileList | File[]): void {
  const accepted = Array.from(list).filter((file) => {
    if (!isAccepted(file)) return false
    if (props.maxSize !== undefined && file.size > props.maxSize) return false
    return true
  })

  /*
   * 用 reactive() 包一层：emit 出去的条目必须是「渲染中的那一份」，
   * 父组件写 entry.status = 'done' 才会真的动到界面。
   * 普通对象的话，列表里放着的是 Vue 的响应式副本，父组件的写入永远不会生效。
   */
  const entries = accepted.map((file) =>
    reactive<UploadFile>({
      file,
      id: nextId(),
      progress: 0,
      status: 'pending',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }),
  )

  // 一次全被拒（类型/体积）时不动现有列表：否则单选模式下用户误拖一个 pdf，已选的文件就没了
  if (entries.length > 0) {
    setFiles(props.multiple ? [...files.value, ...entries] : entries.slice(0, 1))
  }
  emit('select', entries)
}

function onDragEnter(): void {
  if (props.disabled) return
  dragDepth += 1
  dragging.value = true
}

function onDragLeave(): void {
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) dragging.value = false
}

function onDrop(event: DragEvent): void {
  dragDepth = 0
  dragging.value = false
  if (props.disabled || !event.dataTransfer?.files.length) return
  addFiles(event.dataTransfer.files)
}

function onInputChange(event: Event): void {
  const input = event.target as HTMLInputElement
  if (input.files?.length) addFiles(input.files)
  // 清空 value：同一个文件连选两次也要触发 change
  input.value = ''
}

function removeFile(entry: UploadFile): void {
  setFiles(files.value.filter((item) => item.id !== entry.id))
  emit('remove', entry)
}

function clear(): void {
  if (files.value.length > 0) setFiles([])
}

function openPicker(): void {
  if (!props.disabled) inputEl.value?.click()
}

defineExpose({ files, clear })
</script>

<template>
  <div class="md-upload">
    <button
      type="button"
      class="md-upload__zone"
      :class="{ 'is-dragging': dragging, 'is-disabled': disabled }"
      :disabled="disabled"
      @click="openPicker"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <M3Icon :icon="icon ?? IconUpload" :size="40" class="md-upload__zone-icon" />

      <span class="md-upload__zone-text">
        <slot name="dropzone">
          <span class="md-upload__headline">
            {{ dropText }} <span class="md-upload__select">{{ selectText }}</span>
          </span>
          <span v-if="accept || maxSize" class="md-upload__meta">
            <span v-if="accept">{{ accept }}</span>
            <span v-if="accept && maxSize"> · </span>
            <span v-if="maxSize">{{ maxSizeLabel }} {{ formatSize(maxSize) }}</span>
          </span>
        </slot>
      </span>
    </button>

    <input
      ref="inputEl"
      class="md-upload__input"
      type="file"
      :accept="accept || undefined"
      :multiple="multiple"
      :disabled="disabled"
      @change="onInputChange"
    />

    <TransitionGroup tag="ul" name="md-upload-row" class="md-upload__list" role="list">
      <li v-for="entry in files" :key="entry.id" class="md-upload__row">
        <span class="md-upload__thumb">
          <img v-if="entry.preview" :src="entry.preview" alt="" class="md-upload__preview" />
          <M3Icon v-else :icon="IconDescription" :size="24" class="md-upload__thumb-icon" />
        </span>

        <span class="md-upload__info">
          <span class="md-upload__name" :title="entry.file.name">{{ entry.file.name }}</span>
          <span class="md-upload__size">{{ formatSize(entry.file.size) }}</span>
          <M3Progress
            v-if="entry.status === 'uploading'"
            class="md-upload__progress"
            :value="entry.progress"
            :label="entry.file.name + ' 上传进度'"
          />
        </span>

        <span class="md-upload__status">
          <M3Progress
            v-if="entry.status === 'uploading'"
            variant="circular"
            :size="20"
            :label="entry.file.name + ' 上传中'"
          />
          <M3Icon v-else-if="entry.status === 'done'" :icon="IconCheckCircle" :size="20" class="md-upload__done" />
          <M3Icon v-else-if="entry.status === 'error'" :icon="IconError" :size="20" class="md-upload__failed" />
        </span>

        <M3IconButton
          :icon="IconClose"
          :label="removeLabel"
          size="sm"
          @click="removeFile(entry)"
        />
      </li>
    </TransitionGroup>

    <div v-if="$slots.actions && files.length" class="md-upload__actions">
      <slot name="actions" :files="files" :clear="clear" />
    </div>
  </div>
</template>

<style scoped>
.md-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: var(--md-ref-typeface-plain);
}

/* ---------- 拖拽区 ---------- */
.md-upload__zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 160px;
  padding: 24px;
  border: 2px dashed var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-on-surface);
  font: inherit;
  cursor: pointer;
  transition:
    border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
}

@media (hover: hover) {
  .md-upload__zone:hover:not(.is-disabled) {
    border-color: var(--md-sys-color-primary);
    background-color: color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent);
  }
}

/* 拖拽悬停：底色换成 primary-container，比只改描边更「亮」，一眼看出松手会落在这里 */
.md-upload__zone.is-dragging {
  border-color: var(--md-sys-color-primary);
  border-style: solid;
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  scale: 1.01;
}

.md-upload__zone:active:not(.is-disabled) {
  scale: 0.995;
}

.md-upload__zone-icon {
  color: var(--md-sys-color-on-surface-variant);
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-upload__zone.is-dragging .md-upload__zone-icon {
  color: var(--md-sys-color-on-primary-container);
}

.md-upload__zone-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.md-upload__headline {
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}

.md-upload__select {
  color: var(--md-sys-color-primary);
  font-weight: var(--md-ref-typeface-weight-medium);
}

.md-upload__zone.is-dragging .md-upload__select {
  color: inherit;
}

.md-upload__meta {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.md-upload__input {
  display: none;
}

/* ---------- 文件行 ---------- */
.md-upload__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.md-upload__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
}

.md-upload__thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-small);
  background-color: var(--md-sys-color-surface-container-high);
}

.md-upload__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.md-upload__thumb-icon {
  color: var(--md-sys-color-on-surface-variant);
}

.md-upload__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.md-upload__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

.md-upload__size {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  font-variant-numeric: tabular-nums;
}

.md-upload__progress {
  margin-block-start: 4px;
}

.md-upload__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.md-upload__done {
  color: var(--md-sys-color-primary);
}

.md-upload__failed {
  color: var(--md-sys-color-error);
}

.md-upload__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* ---------- 行入场 ---------- */
.md-upload-row-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-upload-row-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    transform var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
  position: absolute;
  width: 100%;
}

.md-upload-row-enter-from,
.md-upload-row-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.md-upload-row-move {
  transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

/* ---------- 禁用 ---------- */
.md-upload__zone.is-disabled {
  cursor: not-allowed;
  border-color: color-mix(in srgb, var(--md-sys-color-outline-variant) 50%, transparent);
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .md-upload__zone,
  .md-upload-row-enter-from,
  .md-upload-row-leave-to {
    transform: none;
    scale: 1;
  }
}
</style>
