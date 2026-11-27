import { ref, watch, type Ref } from 'vue'

/**
 * 存进 localStorage 的响应式值。
 *
 * 三个细节：
 *   - 隐私模式下 localStorage 会抛异常，读写都要兜住，否则整个组件初始化就挂了；
 *   - 跨标签页同步靠 storage 事件，否则两个标签页会各写各的；
 *   - 存的是 JSON，读回来的形状不一定可信，支持传 validate 兜底。
 */
export interface LocalStorageOptions<T> {
  /** 序列化方式，默认 JSON。 */
  serializer?: {
    read: (raw: string) => T
    write: (value: T) => string
  }
  /** 读回来的值是否可用；返回 false 时用默认值。 */
  validate?: (value: unknown) => value is T
  /** 监听其他标签页的改动。 */
  sync?: boolean
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
  options: LocalStorageOptions<T> = {},
): Ref<T> {
  const serializer = options.serializer ?? {
    read: (raw: string) => JSON.parse(raw) as T,
    write: (value: T) => JSON.stringify(value),
  }

  function read(): T {
    if (typeof localStorage === 'undefined') return initial
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return initial
      const parsed = serializer.read(raw) as unknown
      if (options.validate && !options.validate(parsed)) return initial
      return parsed as T
    } catch {
      return initial
    }
  }

  const state = ref(read()) as Ref<T>

  function write(value: T): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(key, serializer.write(value))
    } catch {
      // 配额满 / 隐私模式：不持久化，但这次会话仍然可用
    }
  }

  watch(state, write, { deep: true })

  if (options.sync !== false && typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== key || event.newValue === null) return
      try {
        state.value = serializer.read(event.newValue)
      } catch {
        // 别的标签页写坏了：忽略
      }
    })
  }

  return state
}
