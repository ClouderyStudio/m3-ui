/**
 * 日期与时间的本地化格式化/解析（不引第三方库）。
 *
 * 约定：对外一律用本地日期串 'YYYY-MM-DD' 与时间串 'HH:mm[:ss]'，
 * 只在「显示」和「构造 Date」的时候才转成对象。
 * 直接传 Date 对象跨组件会引入时区陷阱：'2026-11-01' 在 UTC-5 解析成 10 月 31 日。
 */

export function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function toIsoDate(date: Date): string {
  return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate())
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

/** 本地日期串 → 本地化显示（默认 2026年11月27日）。 */
export function formatDate(value: string | null, locale?: string, style: 'long' | 'medium' | 'short' = 'medium'): string {
  const date = parseIsoDate(value)
  if (!date) return ''
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: style }).format(date)
  } catch {
    return value ?? ''
  }
}

export interface TimeParts {
  hours: number
  minutes: number
  seconds: number
}

export function parseTime(value: string | null | undefined): TimeParts {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value ?? '')
  if (!match) return { hours: 0, minutes: 0, seconds: 0 }
  return {
    hours: Math.min(23, Number(match[1])),
    minutes: Math.min(59, Number(match[2])),
    seconds: Math.min(59, Number(match[3] ?? 0)),
  }
}

/** 24 小时制存储，12/24 小时制显示。 */
export function formatTime(parts: TimeParts, format: '12h' | '24h' = '24h', withSeconds = false): string {
  const suffix = withSeconds ? ':' + pad2(parts.seconds) : ''
  if (format === '24h') return pad2(parts.hours) + ':' + pad2(parts.minutes) + suffix
  const hours = parts.hours % 12 === 0 ? 12 : parts.hours % 12
  const meridiem = parts.hours < 12 ? 'AM' : 'PM'
  return pad2(hours) + ':' + pad2(parts.minutes) + suffix + ' ' + meridiem
}

/** 两个日期之间的天数（含端点由调用方决定）。 */
export function daysBetween(start: string, end: string): number {
  const a = parseIsoDate(start)
  const b = parseIsoDate(end)
  if (!a || !b) return 0
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}
