/**
 * 逐行文本差异（LCS）。
 *
 * 为什么不是「逐行比较」：中间插一行会让它后面所有行都显示成改动，
 * 用户得在一屏红色里找那一行真正的变化。LCS 只标真正的增删。
 *
 * n×m 的 DP 在几千行内是毫秒级；超过阈值（默认 400 万格）退回逐行比较，
 * 并在结果里标记 degraded —— 几万行的矩阵会吃掉几百 MB 内存。
 */
export type DiffRowType = 'same' | 'add' | 'remove' | 'gap'

export interface DiffRow {
  type: DiffRowType
  text?: string
  /** 修改前的行号。 */
  oldNo?: number
  /** 修改后的行号。 */
  newNo?: number
  /** gap 行省略掉的相同行数。 */
  skipped?: number
}

export interface DiffOptions {
  /** 每个改动块上下保留的相同行数。 */
  context?: number
  /** 超过这个格子数就退化为逐行比较。 */
  maxCells?: number
}

export interface DiffResult {
  rows: DiffRow[]
  added: number
  removed: number
  /** 是否因为文本太大而退化为逐行比较。 */
  degraded: boolean
}

function rawRows(left: string[], right: string[], maxCells: number): { rows: DiffRow[]; degraded: boolean } {
  const rows: DiffRow[] = []

  if (left.length * right.length > maxCells) {
    const length = Math.max(left.length, right.length)
    for (let index = 0; index < length; index += 1) {
      const before = left[index]
      const after = right[index]
      if (before === after) rows.push({ type: 'same', text: before ?? '', oldNo: index + 1, newNo: index + 1 })
      else {
        if (before !== undefined) rows.push({ type: 'remove', text: before, oldNo: index + 1 })
        if (after !== undefined) rows.push({ type: 'add', text: after, newNo: index + 1 })
      }
    }
    return { rows, degraded: true }
  }

  const n = left.length
  const m = right.length
  const table = new Uint32Array((n + 1) * (m + 1))
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      table[i * (m + 1) + j] =
        left[i] === right[j]
          ? (table[(i + 1) * (m + 1) + (j + 1)] ?? 0) + 1
          : Math.max(table[(i + 1) * (m + 1) + j] ?? 0, table[i * (m + 1) + (j + 1)] ?? 0)
    }
  }

  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (left[i] === right[j]) {
      rows.push({ type: 'same', text: left[i], oldNo: i + 1, newNo: j + 1 })
      i += 1
      j += 1
    } else if ((table[(i + 1) * (m + 1) + j] ?? 0) >= (table[i * (m + 1) + (j + 1)] ?? 0)) {
      rows.push({ type: 'remove', text: left[i], oldNo: i + 1 })
      i += 1
    } else {
      rows.push({ type: 'add', text: right[j], newNo: j + 1 })
      j += 1
    }
  }
  while (i < n) {
    rows.push({ type: 'remove', text: left[i], oldNo: i + 1 })
    i += 1
  }
  while (j < m) {
    rows.push({ type: 'add', text: right[j], newNo: j + 1 })
    j += 1
  }
  return { rows, degraded: false }
}

/** 把未改动的长段折叠成一条 gap 行。 */
function collapse(rows: DiffRow[], context: number): DiffRow[] {
  const keep = new Set<number>()
  rows.forEach((row, index) => {
    if (row.type === 'same') return
    for (let offset = -context; offset <= context; offset += 1) {
      const target = index + offset
      if (target >= 0 && target < rows.length) keep.add(target)
    }
  })

  const result: DiffRow[] = []
  let skipped = 0
  rows.forEach((row, index) => {
    if (keep.has(index)) {
      if (skipped > 0) {
        result.push({ type: 'gap', skipped })
        skipped = 0
      }
      result.push(row)
    } else {
      skipped += 1
    }
  })
  if (skipped > 0) result.push({ type: 'gap', skipped })
  return result
}

export function diffLines(before: string, after: string, options: DiffOptions = {}): DiffResult {
  const { rows, degraded } = rawRows(before.split('\n'), after.split('\n'), options.maxCells ?? 4_000_000)
  let added = 0
  let removed = 0
  for (const row of rows) {
    if (row.type === 'add') added += 1
    if (row.type === 'remove') removed += 1
  }
  return {
    rows: collapse(rows, options.context ?? 3),
    added,
    removed,
    degraded,
  }
}
