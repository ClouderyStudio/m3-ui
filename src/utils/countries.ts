/**
 * 国家/地区与拨号代码。
 *
 * 只收常用的一批（约 60 个），而不是全量 ISO 3166：
 * 全量清单里大半是用户永远不会选的属地，塞进来只会把下拉拉得更长。
 * 需要全量时使用方可以自己传 options 给 M3CountrySelect。
 */
export interface Country {
  /** ISO 3166-1 alpha-2，例如 'CN'。 */
  iso: string
  /** 中文名。 */
  name: string
  /** 国际拨号代码，带 +。 */
  dial: string
}

export const COUNTRIES: Country[] = [
  { iso: 'CN', name: '中国大陆', dial: '+86' },
  { iso: 'HK', name: '中国香港', dial: '+852' },
  { iso: 'MO', name: '中国澳门', dial: '+853' },
  { iso: 'TW', name: '中国台湾', dial: '+886' },
  { iso: 'JP', name: '日本', dial: '+81' },
  { iso: 'KR', name: '韩国', dial: '+82' },
  { iso: 'SG', name: '新加坡', dial: '+65' },
  { iso: 'MY', name: '马来西亚', dial: '+60' },
  { iso: 'TH', name: '泰国', dial: '+66' },
  { iso: 'VN', name: '越南', dial: '+84' },
  { iso: 'ID', name: '印度尼西亚', dial: '+62' },
  { iso: 'PH', name: '菲律宾', dial: '+63' },
  { iso: 'IN', name: '印度', dial: '+91' },
  { iso: 'PK', name: '巴基斯坦', dial: '+92' },
  { iso: 'BD', name: '孟加拉国', dial: '+880' },
  { iso: 'LK', name: '斯里兰卡', dial: '+94' },
  { iso: 'AE', name: '阿联酋', dial: '+971' },
  { iso: 'SA', name: '沙特阿拉伯', dial: '+966' },
  { iso: 'IL', name: '以色列', dial: '+972' },
  { iso: 'TR', name: '土耳其', dial: '+90' },
  { iso: 'RU', name: '俄罗斯', dial: '+7' },
  { iso: 'UA', name: '乌克兰', dial: '+380' },
  { iso: 'PL', name: '波兰', dial: '+48' },
  { iso: 'CZ', name: '捷克', dial: '+420' },
  { iso: 'DE', name: '德国', dial: '+49' },
  { iso: 'AT', name: '奥地利', dial: '+43' },
  { iso: 'CH', name: '瑞士', dial: '+41' },
  { iso: 'FR', name: '法国', dial: '+33' },
  { iso: 'IT', name: '意大利', dial: '+39' },
  { iso: 'ES', name: '西班牙', dial: '+34' },
  { iso: 'PT', name: '葡萄牙', dial: '+351' },
  { iso: 'NL', name: '荷兰', dial: '+31' },
  { iso: 'BE', name: '比利时', dial: '+32' },
  { iso: 'SE', name: '瑞典', dial: '+46' },
  { iso: 'NO', name: '挪威', dial: '+47' },
  { iso: 'DK', name: '丹麦', dial: '+45' },
  { iso: 'FI', name: '芬兰', dial: '+358' },
  { iso: 'IE', name: '爱尔兰', dial: '+353' },
  { iso: 'GB', name: '英国', dial: '+44' },
  { iso: 'US', name: '美国', dial: '+1' },
  { iso: 'CA', name: '加拿大', dial: '+1' },
  { iso: 'MX', name: '墨西哥', dial: '+52' },
  { iso: 'BR', name: '巴西', dial: '+55' },
  { iso: 'AR', name: '阿根廷', dial: '+54' },
  { iso: 'CL', name: '智利', dial: '+56' },
  { iso: 'CO', name: '哥伦比亚', dial: '+57' },
  { iso: 'PE', name: '秘鲁', dial: '+51' },
  { iso: 'AU', name: '澳大利亚', dial: '+61' },
  { iso: 'NZ', name: '新西兰', dial: '+64' },
  { iso: 'ZA', name: '南非', dial: '+27' },
  { iso: 'EG', name: '埃及', dial: '+20' },
  { iso: 'NG', name: '尼日利亚', dial: '+234' },
  { iso: 'KE', name: '肯尼亚', dial: '+254' },
  { iso: 'MA', name: '摩洛哥', dial: '+212' },
  { iso: 'KZ', name: '哈萨克斯坦', dial: '+7' },
  { iso: 'AZ', name: '阿塞拜疆', dial: '+994' },
  { iso: 'GE', name: '格鲁吉亚', dial: '+995' },
  { iso: 'MN', name: '蒙古', dial: '+976' },
  { iso: 'NP', name: '尼泊尔', dial: '+977' },
  { iso: 'KH', name: '柬埔寨', dial: '+855' },
  { iso: 'MM', name: '缅甸', dial: '+95' },
]

const byIso = new Map(COUNTRIES.map((country) => [country.iso.toUpperCase(), country]))

export function findCountry(iso: string): Country | undefined {
  return byIso.get(iso.toUpperCase())
}

/** ISO 码 → 国旗 emoji（区域指示符是两个 Unicode 码点，不需要图片资源）。 */
export function flagOf(iso: string): string {
  const code = iso.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return ''
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  )
}

/** 只保留数字。 */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * 按国家给手机号分组。
 *
 * 只覆盖几个常见的号码长度规则，其余按三位一段切 —— 国内/日本/美国这类
 * 固定分组能让用户一眼核对，剩下的大多数国家三位一段也足够读。
 */
export function formatPhone(digits: string, iso = 'CN'): string {
  const bare = phoneDigits(digits)
  if (!bare) return ''
  const groups: Record<string, number[]> = {
    CN: [3, 4, 4],
    US: [3, 3, 4],
    CA: [3, 3, 4],
    JP: [2, 4, 4],
    GB: [4, 6],
    AU: [3, 3, 3],
    DE: [4, 7],
    FR: [2, 2, 2, 2],
    KR: [2, 4, 4],
    SG: [4, 4],
  }
  const sizes = groups[iso.toUpperCase()] ?? [3, 3, 3, 3, 3]
  const parts: string[] = []
  let cursor = 0
  for (const size of sizes) {
    if (cursor >= bare.length) break
    parts.push(bare.slice(cursor, cursor + size))
    cursor += size
  }
  if (cursor < bare.length) parts.push(bare.slice(cursor))
  return parts.join(' ')
}
