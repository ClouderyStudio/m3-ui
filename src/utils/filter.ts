/**
 * 筛选树：字段 + 运算符 + 值，按「且 / 或」组合，可嵌套分组。
 *
 * 结构就是一份纯 JSON，可以直接发给服务端，也可以本地跑 filterRows()。
 * 每个字段的类型决定可选运算符与值的输入控件 —— 让数字字段出现「包含」、
 * 日期字段出现「大于」，用户会先猜错再改，不如不给。
 */

export type FilterFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean'

export interface FilterField {
  key: string
  label: string
  type: FilterFieldType
  /** select 类型的候选项。 */
  options?: { value: string; label: string }[]
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'startsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'isTrue'
  | 'isFalse'

export interface FilterRule {
  id: string
  kind: 'rule'
  field: string
  operator: FilterOperator
  value: string | number | boolean | null
  /** between 的第二个值。 */
  value2?: string | number | null
}

export interface FilterGroup {
  id: string
  kind: 'group'
  conjunction: 'and' | 'or'
  children: (FilterRule | FilterGroup)[]
}

let counter = 0

function nextId(prefix: string): string {
  counter += 1
  return prefix + '-' + counter
}

export function createFilter(): FilterGroup {
  return { id: nextId('group'), kind: 'group', conjunction: 'and', children: [] }
}

export function createRule(field?: FilterField): FilterRule {
  return {
    id: nextId('rule'),
    kind: 'rule',
    field: field?.key ?? '',
    operator: field ? defaultOperator(field.type) : 'eq',
    value: field?.type === 'boolean' ? 'true' : '',
    value2: null,
  }
}

export function defaultOperator(type: FilterFieldType): FilterOperator {
  if (type === 'number' || type === 'date') return 'eq'
  if (type === 'boolean') return 'isTrue'
  return 'contains'
}

const OPERATORS: Record<FilterFieldType, FilterOperator[]> = {
  text: ['contains', 'eq', 'neq', 'startsWith'],
  number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
  date: ['eq', 'gt', 'lt', 'between'],
  select: ['eq', 'neq'],
  boolean: ['isTrue', 'isFalse'],
}

export function operatorsFor(type: FilterFieldType): FilterOperator[] {
  return OPERATORS[type] ?? OPERATORS.text
}

const LABELS: Record<FilterOperator, string> = {
  eq: '等于',
  neq: '不等于',
  contains: '包含',
  startsWith: '开头是',
  gt: '大于',
  gte: '大于等于',
  lt: '小于',
  lte: '小于等于',
  between: '介于',
  isTrue: '是',
  isFalse: '否',
}

export function operatorLabel(operator: FilterOperator): string {
  return LABELS[operator] ?? operator
}

export function countRules(group: FilterGroup | null | undefined): number {
  if (!group) return 0
  return group.children.reduce(
    (total, child) => total + (child.kind === 'group' ? countRules(child) : 1),
    0,
  )
}

function asNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function compare(left: unknown, operator: FilterOperator, rule: FilterRule): boolean {
  if (operator === 'isTrue') return Boolean(left) === true
  if (operator === 'isFalse') return Boolean(left) === false

  if (rule.field && typeof left === 'number') {
    const right = asNumber(rule.value)
    switch (operator) {
      case 'eq':
        return left === right
      case 'neq':
        return left !== right
      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte': {
        const other = asNumber(rule.value2)
        if (!Number.isNaN(other)) {
          const low = Math.min(right, other)
          const high = Math.max(right, other)
          if (operator === 'gt') return left > high
          if (operator === 'gte') return left >= high
          if (operator === 'lt') return left < low
          return left <= low
        }
        if (operator === 'gt') return left > right
        if (operator === 'gte') return left >= right
        if (operator === 'lt') return left < right
        return left <= right
      }
      default:
        return true
    }
  }

  const text = String(left ?? '').toLowerCase()
  const value = String(rule.value ?? '').toLowerCase()

  switch (operator) {
    case 'eq':
      return text === value
    case 'neq':
      return text !== value
    case 'contains':
      return text.includes(value)
    case 'startsWith':
      return text.startsWith(value)
    case 'gt':
      return left !== null && String(left) > String(rule.value ?? '')
    case 'lt':
      return left !== null && String(left) < String(rule.value ?? '')
    case 'between': {
      const other = String(rule.value2 ?? '')
      const low = value <= other ? value : other
      const high = value <= other ? other : value
      return text >= low && text <= high
    }
    default:
      return true
  }
}

export function matchesFilter(
  row: Record<string, unknown>,
  filter: FilterGroup | null | undefined,
  fields: FilterField[] = [],
): boolean {
  if (!filter || filter.children.length === 0) return true

  const evaluate = (group: FilterGroup): boolean => {
    const results = group.children.map((child) => {
      if (child.kind === 'group') return evaluate(child)
      // 还没填完的规则视为「不构成条件」，避免空规则把整张表筛空
      if (!child.field) return true
      const field = fields.find((entry) => entry.key === child.field)
      if (!field) return true
      if (child.operator !== 'isTrue' && child.operator !== 'isFalse') {
        if (child.value === '' || child.value === null || child.value === undefined) return true
      }
      return compare(row[child.field], child.operator, child)
    })

    return group.conjunction === 'and' ? results.every(Boolean) : results.some(Boolean)
  }

  return evaluate(filter)
}

export function filterRows<T>(
  rows: T[],
  filter: FilterGroup | null | undefined,
  fields: FilterField[] = [],
  toRecord: (row: T) => Record<string, unknown> = (row) => row as unknown as Record<string, unknown>,
): T[] {
  return rows.filter((row) => matchesFilter(toRecord(row), filter, fields))
}
