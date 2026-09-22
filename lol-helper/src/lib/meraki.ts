export type MerakiModifier = {
  values: number[]
  units: string[]
}

export type MerakiLeveling = {
  attribute: string
  modifiers: MerakiModifier[]
}

export type MerakiEffect = {
  description: string
  leveling: MerakiLeveling[]
}

export type MerakiAbility = {
  name: string
  icon?: string
  effects: MerakiEffect[]
  cooldown?: { modifiers: MerakiModifier[]; affectedByCdr?: boolean }
  cost?: { modifiers: MerakiModifier[] }
  damageType?: string | null
  blurb?: string
}

export type MerakiStat = {
  flat: number
  percent: number
  perLevel: number
  percentPerLevel: number
}

export type MerakiChampion = {
  id: number
  key: string
  name: string
  title: string
  stats: Record<string, MerakiStat>
  abilities: Record<'P' | 'Q' | 'W' | 'E' | 'R', MerakiAbility[]>
}

const MERAKI_BASE =
  'https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US'

export type MerakiItemStat = {
  flat: number
  percent: number
  perLevel: number
  percentPerLevel: number
  percentBase?: number
  percentBonus?: number
}

export type MerakiItem = {
  id: number
  name: string
  stats: Record<string, MerakiItemStat>
}

const champCache = new Map<string, MerakiChampion>()
const itemCache = new Map<string, MerakiItem>()

export async function fetchMerakiChampion(
  key: string,
): Promise<MerakiChampion> {
  if (champCache.has(key)) return champCache.get(key)!
  const res = await fetch(`${MERAKI_BASE}/champions/${key}.json`)
  if (!res.ok) throw new Error(`Meraki 챔피언 데이터 실패: ${key}`)
  const data = (await res.json()) as MerakiChampion
  champCache.set(key, data)
  return data
}

export async function fetchMerakiItem(id: string): Promise<MerakiItem | null> {
  if (itemCache.has(id)) return itemCache.get(id)!
  const res = await fetch(`${MERAKI_BASE}/items/${id}.json`)
  if (!res.ok) return null
  const data = (await res.json()) as MerakiItem
  itemCache.set(id, data)
  return data
}
