<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { IconClose, IconVisibility, IconVisibilityOff, type IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'

/**
 * 表单输入框（MD3 filled / outlined text field）。
 *
 * 要点：
 *   - filled：容器 56dp 高，顶角 4dp、底角 0，底色是 surface-container-highest；
 *   - outlined：1dp 描边，浮动标签把描边「切开」一个缺口；
 *   - 标签在空且未聚焦时占据正文位置，聚焦或有值后缩到上方 / 描边上；
 *   - filled 底部一条 1dp 的 outline 指示线，聚焦时变 2dp 主色（不是整圈发光）；
 *   - 错误态换成 error 角色，同时用 aria-invalid + aria-describedby 表达给读屏；
 *   - multiline 用具名 textarea，仍然共用同一套标签 / 计数 / 错误逻辑。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    type?: 'text' | 'email' | 'password' | 'tel' | 'search' | 'url' | 'number'
    /** MD3 field style. Outlined puts a 1dp border around the whole field. */
    variant?: 'filled' | 'outlined'
    placeholder?: string
    /** Leading icon, typically an affordance (search, mail, lock). */
    icon?: IconComponent | null
    /** 必填标记（只影响视觉与 aria-required）。 */
    required?: boolean
    /** 错误文案；非空时输入框转成错误态。 */
    error?: string
    /** 提示文案（错误为空时显示）。 */
    hint?: string
    autocomplete?: string
    disabled?: boolean
    readonly?: boolean
    /** 输入框右侧的主操作文字（如「发送验证码」）。 */
    actionText?: string
    /** 右侧主操作是否禁用（例如倒计时中）。 */
    actionDisabled?: boolean
    /** 右侧主操作是否处于加载态。 */
    actionLoading?: boolean
    /** 密码可见切换。 */
    revealable?: boolean
    /** 允许一键清空（搜索框用）。 */
    clearable?: boolean
    /** 多行输入（等价于 textarea）。 */
    multiline?: boolean
    /** textarea 的默认行数。 */
    rows?: number
    maxlength?: number
    /** 显示「已输入 / 上限」计数；默认在有 maxlength 时开启。 */
    showCounter?: boolean
    inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal' | 'search' | 'url' | 'none'
    name?: string
  }>(),
  {
    type: 'text',
    variant: 'filled',
    placeholder: '',
    icon: null,
    required: false,
    error: '',
    hint: '',
    autocomplete: 'off',
    disabled: false,
    readonly: false,
    actionText: '',
    actionDisabled: false,
    actionLoading: false,
    revealable: false,
    clearable: false,
    multiline: false,
    rows: 3,
    maxlength: undefined,
    showCounter: undefined,
    inputmode: 'text',
    name: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  action: []
  blur: []
  focus: []
  keydown: [event: KeyboardEvent]
}>()

const fieldId = useId()
const describedBy = computed(() => {
  if (props.error) return fieldId + '-error'
  if (props.hint) return fieldId + '-hint'
  return undefined
})

const focused = ref(false)
const revealed = ref(false)

const actualType = computed(() => {
  if (props.type !== 'password') return props.type
  return revealed.value ? 'text' : 'password'
})

/** 标签是否上浮：聚焦、有值、或者有占位符（占位符不能和标签叠在一起）。 */
const floating = computed(
  () => focused.value || props.modelValue.length > 0 || Boolean(props.placeholder),
)

const showCounter = computed(() => props.showCounter ?? props.maxlength !== undefined)
const counterText = computed(() => props.modelValue.length + ' / ' + props.maxlength)

const hasTrailing = computed(
  () => Boolean(props.actionText) || props.revealable || (props.clearable && props.modelValue.length > 0),
)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onFocus() {
  focused.value = true
  emit('focus')
}

function onBlur() {
  focused.value = false
  emit('blur')
}

function onKeydown(event: KeyboardEvent) {
  emit('keydown', event)
}

function clear() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div
    class="field"
    :class="[
      'field--' + variant,
      {
        'is-floating': floating,
        'is-focused': focused,
        'is-invalid': !!error,
        'is-disabled': disabled,
        'has-trailing': hasTrailing,
        'has-icon': !!icon,
        'is-multiline': multiline,
      },
    ]"
  >
    <div class="field__container">
      <M3Icon v-if="icon" :icon="icon" :size="20" class="field__leading" />

      <label class="field__label" :for="fieldId">
        {{ label }}<span v-if="required" class="field__required" aria-hidden="true">*</span>
        <span v-if="required" class="sr-only">（必填）</span>
      </label>

      <textarea
        v-if="multiline"
        :id="fieldId"
        class="field__input field__input--multiline"
        :style="{ '--md-field-multiline-rows': rows }"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :maxlength="maxlength"
        :inputmode="inputmode"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <input
        v-else
        :id="fieldId"
        class="field__input"
        :name="name"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :inputmode="inputmode"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <div v-if="hasTrailing" class="field__trailing">
        <M3IconButton
          v-if="clearable && modelValue"
          :icon="IconClose"
          label="清空"
          size="sm"
          variant="standard"
          @click="clear"
        />
        <M3IconButton
          v-if="revealable && type === 'password'"
          :icon="revealed ? IconVisibilityOff : IconVisibility"
          :label="revealed ? '隐藏密码' : '显示密码'"
          :selected="revealed"
          size="sm"
          variant="standard"
          @click="revealed = !revealed"
        />
        <button
          v-if="actionText"
          class="field__action"
          type="button"
          :disabled="actionDisabled || disabled || actionLoading"
          @click="emit('action')"
        >
          <span v-if="actionLoading" class="field__spinner" aria-hidden="true" />
          {{ actionText }}
        </button>
      </div>
    </div>

    <div v-if="variant === 'filled'" class="field__indicator" />

    <div v-if="error || hint || showCounter" class="field__support-row">
      <p v-if="error" :id="fieldId + '-error'" class="field__support field__support--error" role="alert">
        {{ error }}
      </p>
      <p v-else-if="hint" :id="fieldId + '-hint'" class="field__support">{{ hint }}</p>
      <span v-else />
      <span v-if="showCounter" class="field__counter">{{ counterText }}</span>
    </div>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
}

.field__container {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 56px;
  padding-inline: 16px;
  border-start-start-radius: var(--md-sys-shape-corner-extra-small);
  border-start-end-radius: var(--md-sys-shape-corner-extra-small);
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* ---------- Filled ---------- */
.field--filled .field__container {
  background-color: var(--md-sys-color-surface-container-highest);
}

.field--filled.has-icon .field__container {
  padding-inline-start: 48px;
}

.field--filled.is-multiline .field__container {
  align-items: flex-start;
  /* 顶部标签带由 textarea 的透明上边框提供，容器只负责底部留白 */
  padding-block: 0 4px;
}

/*
 * 多行：标签不能按「整个高盒子的垂直中心」定位。
 *
 * 单行盒子只有 56dp，中心对齐与首行对齐恰好重合，所以看不出问题；
 * 多行盒子会随内容长到 100dp 以上，标签停在中心、浮动时也只上移 22px，
 * 结果正好压在第一行文字上（输入内容后非常明显）。
 *
 * 这里改成锚定到「文本区第一行」：
 *   容器 padding-top 8 + 文本区 padding-top 24 + 行高 24 的一半 = 中心 44dp
 * 浮动时再上移 28dp → 中心 16dp，落在容器顶部留白里，不再碰文字。
 */
.field--filled.is-multiline .field__label {
  inset-block-start: 36px;
}

/* 浮动后中心落到 8dp：正好在 24dp 标签带的竖直中线，与单行版的 8dp 一致 */
.field--filled.is-multiline.is-floating .field__label {
  translate: 0 calc(-50% - 28px);
}

@media (hover: hover) {
  .field--filled .field__container:hover {
    background-color: color-mix(
      in srgb,
      var(--md-sys-color-on-surface) 6%,
      var(--md-sys-color-surface-container-highest)
    );
  }
}

.field__leading {
  position: absolute;
  inset-inline-start: 12px;
  inset-block-start: 50%;
  translate: 0 -50%;
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
}

/*
 * 多行时图标要跟「第一行文字」对齐，而不是盒子正中 ——
 * 盒子随内容长高后，居中会让图标漂到第二三行旁边（实测落在 48~68dp，正好压着正文）。
 * 锚点与标签共用同一套首行基线：filled 36dp、outlined 37dp（含 1dp 描边）。
 */
.field--filled.is-multiline .field__leading {
  inset-block-start: 36px;
}

.field--outlined.is-multiline .field__leading {
  inset-block-start: 33px;
  /* 图标与首行文字对齐；描边只让整体下移 1dp，不额外补偿 */
}

.field.is-focused .field__leading {
  color: var(--md-sys-color-primary);
}

.field__label {
  position: absolute;
  inset-inline-start: 16px;
  inset-block-start: 50%;
  translate: 0 -50%;
  max-width: calc(100% - 32px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  pointer-events: none;
  transform-origin: start center;
  /*
   * 浮动标签是 M3 里最有辨识度的动效：上浮用 emphasized（先快后慢、微微过冲观感），
   * 字号与颜色跟随同一个时长，三者必须同步，否则标签会「边飞边变粗」。
   */
  transition:
    translate var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized),
    font-size var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.field.has-icon .field__label {
  inset-inline-start: 48px;
}

.field.is-floating .field__label {
  translate: 0 -22px;
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.field.is-focused .field__label {
  color: var(--md-sys-color-primary);
}

/* 错误态优先于聚焦态：聚焦时标签不能还是主色 */
.field.is-invalid .field__label {
  color: var(--md-sys-color-error);
}

.field.has-trailing .field__label {
  max-width: calc(100% - 120px);
}

.field__input {
  width: 100%;
  padding: 0;
  padding-block-start: 16px;
  border: none;
  background: none;
  outline: none;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  caret-color: var(--md-sys-color-primary);
}


/*
 * 多行输入用「透明的上边框」而不是 padding-top 撑出标签带。
 *
 * 关键区别在滚动裁切位置：textarea 的滚动视口包含 padding，
 * 所以 padding-top 里的文字在内容滚上去之后**仍会显示**，正好从浮动标签底下穿过去；
 * 而边框在滚动视口之外，文字滚到那里就被裁掉。
 * 这就是多行框「一滚动字就压到标签上」的根因。
 */
/*
 * 高度按 rows 精确计算，避免「露半行」：
 *   rows × 行高 + 标签带 + 底部留白
 * 只写 min-height 的话，textarea 的默认高度来自 rows 属性，
 * 两者不一致时会出现第 4 行只露出半截的观感（截图中很明显）。
 */
.field__input--multiline {
  --md-field-text-band: 24px;
  --md-field-text-pad-bottom: 4px;

  padding-block: 0;
  border-block-start: var(--md-field-text-band) solid transparent;
  /* 底部留白同样用边框：padding 在滚动视口之内，最后一行会画进去露出半截 */
  border-block-end: var(--md-field-text-pad-bottom) solid transparent;
  /* 高度完全由 rows 决定，不再设一个会与之冲突的 min-height */
  block-size: calc(
    var(--md-field-multiline-rows, 3) * var(--md-sys-typescale-body-large-line-height) +
      var(--md-field-text-band) + var(--md-field-text-pad-bottom)
  );
  min-block-size: calc(
    2 * var(--md-sys-typescale-body-large-line-height) + var(--md-field-text-band) +
      var(--md-field-text-pad-bottom)
  );
  resize: vertical;
  line-height: var(--md-sys-typescale-body-large-line-height);
  box-sizing: border-box;
}

.field__input::placeholder {
  color: transparent;
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.field.is-floating .field__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.field__input:disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  cursor: not-allowed;
}

/*
 * 多行框的滚动条在文字右侧，而 resize 手柄画在右下角，两者会叠在一起。
 * 只给多行留一点内边距，让手柄有独立的角落可用（单行不需要）。
 */
.field__input--multiline {
  padding-inline-end: 4px;
  scrollbar-gutter: stable;
}

.field__trailing {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-inline-end: -8px;
  flex-shrink: 0;
}

.field--filled.is-multiline .field__trailing {
  align-self: flex-start;
  margin-block-start: 4px;
}

.field__action {
  height: 32px;
  padding-inline: 12px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-primary);
  font-family: inherit;
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: var(--md-sys-typescale-label-medium-weight);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .field__action:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
  }
}

.field__action:disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  cursor: not-allowed;
}

.field__spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-inline-end: 6px;
  vertical-align: -2px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--md-sys-shape-corner-full);
  animation: field-spin 640ms linear infinite;
}

@keyframes field-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 底部指示线：1dp 常态、2dp 聚焦、错误态用 error 角色 */
.field__indicator {
  height: 1px;
  margin-inline: 16px;
  background-color: var(--md-sys-color-on-surface-variant);
  transition:
    height var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    margin-inline var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

/*
 * 指示线聚焦时从 1dp 变 2dp 并铺满整宽：宽度变化用 emphasized-decelerate，
 * 让它「刷」地摊开而不是线性拉伸。颜色紧随其后，避免出现灰色 2dp 的中间态。
 */
.field.is-focused .field__indicator {
  height: 2px;
  margin-inline: 0;
  background-color: var(--md-sys-color-primary);
}

.field.is-invalid .field__indicator {
  height: 2px;
  margin-inline: 0;
  background-color: var(--md-sys-color-error);
}

/* ---------- Outlined ---------- */
.field--outlined .field__container {
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background-color: transparent;
}

.field--outlined.has-icon .field__container {
  padding-inline-start: 48px;
}

.field--outlined .field__label {
  inset-inline-start: 12px;
  padding-inline: 4px;
  background-color: transparent;
}

.field--outlined.has-icon .field__label {
  inset-inline-start: 44px;
}

/*
 * 标签缺口：浮动后要用「所在表面」的颜色盖住下面那条 1dp 描边。
 *
 * 这个变量**不能**在 .field 根节点上声明 —— 元素自身的声明永远赢过从祖先继承来的值，
 * 使用方放在外层容器上的覆盖就永远不会生效，缺口会比表面暗一档（实测 #131313 vs #1c1c1c）。
 * 正确做法是只在使用点给 fallback，让祖先设置的值生效。
 */
.field--outlined.is-floating .field__label {
  translate: 0 calc(-50% - 28px);
  background-color: var(--md-field-label-surface, var(--md-sys-color-surface));
}

.field--outlined .field__input {
  padding-block: 0;
}

.field--outlined.is-multiline .field__container {
  align-items: flex-start;
  padding-block: 0;
}

.field--outlined.is-multiline .field__input {
  --md-field-text-band: 20px;
  --md-field-text-pad-bottom: 8px;

  /* 上下留白全部由边框承担，padding 必须为 0（padding 在滚动视口内会露字） */
  padding-block: 0;
  border-block-start: var(--md-field-text-band) solid transparent;
  border-block-end: var(--md-field-text-pad-bottom) solid transparent;
  block-size: calc(
    var(--md-field-multiline-rows, 3) * var(--md-sys-typescale-body-large-line-height) +
      var(--md-field-text-band) + var(--md-field-text-pad-bottom)
  );
  min-block-size: calc(
    2 * var(--md-sys-typescale-body-large-line-height) + var(--md-field-text-band) +
      var(--md-field-text-pad-bottom)
  );
}

/*
 * 未浮动时：标签停在首行中央。
 * 文本区从这里开始：容器边框 1 + 文本区上边框 20 + 行高一半 12 = 32.7dp ≈ 33dp。
 */
.field--outlined.is-multiline .field__label {
  inset-block-start: 33px;
}

/*
 * 浮动后中心落在上边框上（0dp），标签在描边上切出缺口。
 * 位移统一取 28dp（与 filled 一致）：33 - 28 = 5dp，正好落在 1dp 描边的中线附近。
 * 用 33 会让标签整体沉到描边以下，缺口看起来是「贴」在框内而不是「切」在框上。
 */
.field--outlined.is-multiline.is-floating .field__label {
  translate: 0 calc(-50% - 28px);
}

.field--outlined.is-focused .field__container {
  border-color: var(--md-sys-color-primary);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-primary);
}

.field--outlined.is-invalid .field__container {
  border-color: var(--md-sys-color-error);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-error);
}

.field__support-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 16px 0;
}

.field__support {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.field__support--error {
  color: var(--md-sys-color-error);
}

.field__counter {
  margin-inline-start: auto;
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  font-variant-numeric: tabular-nums;
}

/* 必填星号：与标签同色同字号，不额外抢视觉 */
.field__required {
  margin-inline-start: 2px;
  color: var(--md-sys-color-error);
}

.field.is-disabled .field__container {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
}

.field--outlined.is-disabled .field__container {
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  background-color: transparent;
}

.field.is-disabled .field__indicator {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.field.is-disabled .field__label,
.field.is-disabled .field__counter,
.field.is-disabled .field__support {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .field__spinner {
    animation-duration: 1400ms;
  }
}
</style>
