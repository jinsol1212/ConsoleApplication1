const DD = 'https://ddragon.leagueoflegends.com'
const LANG = 'ko_KR'

export type DdChampSummary = {
  id: string
  key: string
  name: string
  title: string
  tags: string[]
  blurb: string
  image: { full: string }
  info: { attack: number; defense: number; magic: number; difficulty: number }
  stats: Record<string, number>
}

export type DdItem = {
  name: string
  description: string
  plaintext: string
  gold: { base: number; total: number; sell: number; purchasable: boolean }
  stats: Record<string, number>
  tags: string[]
  maps: Record<string, boolean>
  into?: string[]
  from?: string[]
  image: { full: string }
}

let versionCache: string | null = null

export async function getVersion(): Promise<string> {
  if (versionCache) return versionCache
  const res = await fetch(`${DD}/api/versions.json`)
  if (!res.ok) throw new Error('패치 버전 조회 실패')
  const versions: string[] = await res.json()
  versionCache = versions[0]
  return versionCache
}

export function champIconUrl(version: string, imageFull: string) {
  return `${DD}/cdn/${version}/img/champion/${imageFull}`
}

export function itemIconUrl(version: string, imageFull: string) {
  return `${DD}/cdn/${version}/img/item/${imageFull}`
}

export function spellIconUrl(version: string, imageFull: string) {
  return `${DD}/cdn/${version}/img/spell/${imageFull}`
}

export function passiveIconUrl(version: string, imageFull: string) {
  return `${DD}/cdn/${version}/img/passive/${imageFull}`
}

export async function fetchChampions(): Promise<{
  version: string
  list: DdChampSummary[]
}> {
  const version = await getVersion()
  const res = await fetch(`${DD}/cdn/${version}/data/${LANG}/champion.json`)
  if (!res.ok) throw new Error('챔피언 목록 조회 실패')
  const data = await res.json()
  const list = Object.values(data.data as Record<string, DdChampSummary>).sort(
    (a, b) => a.name.localeCompare(b.name, 'ko'),
  )
  return { version, list }
}

export async function fetchChampionDetail(id: string) {
  const version = await getVersion()
  const res = await fetch(
    `${DD}/cdn/${version}/data/${LANG}/champion/${id}.json`,
  )
  if (!res.ok) throw new Error(`챔피언 상세 조회 실패: ${id}`)
  const data = await res.json()
  return { version, champ: data.data[id] as DdChampDetail }
}

export type DdSpell = {
  id: string
  name: string
  description: string
  tooltip: string
  cooldown: number[]
  cooldownBurn: string
  cost: number[]
  costBurn: string
  maxrank: number
  rangeBurn: string
  image: { full: string }
}

export type DdChampDetail = DdChampSummary & {
  lore: string
  allytips: string[]
  enemytips: string[]
  spells: DdSpell[]
  passive: {
    name: string
    description: string
    image: { full: string }
  }
  partype: string
}

export async function fetchItems(): Promise<{
  version: string
  items: Record<string, DdItem>
}> {
  const version = await getVersion()
  const res = await fetch(`${DD}/cdn/${version}/data/${LANG}/item.json`)
  if (!res.ok) throw new Error('아이템 목록 조회 실패')
  const data = await res.json()
  return { version, items: data.data as Record<string, DdItem> }
}

/** SR 구매 가능 완성 아이템 위주 */
export function usableItems(items: Record<string, DdItem>) {
  return Object.entries(items)
    .filter(([, it]) => {
      if (!it.gold?.purchasable) return false
      if (it.maps && it.maps['11'] === false) return false
      if (it.gold.total < 300) return false
      return true
    })
    .map(([id, it]) => ({ id, ...it }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}
