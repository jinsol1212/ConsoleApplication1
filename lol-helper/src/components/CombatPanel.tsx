import { useEffect, useMemo, useState } from 'react'
import {
  abilityCooldown,
  autoAttackDamage,
  buildStats,
  calcAbilityDamage,
  parseDdItemStats,
  parseMerakiItemStats,
  round0,
  round1,
  sumItems,
  type ItemMods,
} from '../lib/combat'
import {
  champIconUrl,
  fetchChampionDetail,
  fetchChampions,
  fetchItems,
  itemIconUrl,
  usableItems,
  type DdChampSummary,
  type DdItem,
} from '../lib/ddragon'
import {
  fetchMerakiChampion,
  fetchMerakiItem,
  type MerakiChampion,
} from '../lib/meraki'

type SideState = {
  champId: string
  level: number
  itemIds: string[]
  ranks: { Q: number; W: number; E: number; R: number }
}

const defaultSide = (champId: string): SideState => ({
  champId,
  level: 6,
  itemIds: [],
  ranks: { Q: 3, W: 1, E: 1, R: 1 },
})

export function CombatPanel() {
  const [version, setVersion] = useState('')
  const [champs, setChamps] = useState<DdChampSummary[]>([])
  const [items, setItems] = useState<Record<string, DdItem>>({})
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [me, setMe] = useState<SideState>(defaultSide('Garen'))
  const [foe, setFoe] = useState<SideState>(defaultSide('Darius'))
  const [merakiMe, setMerakiMe] = useState<MerakiChampion | null>(null)
  const [merakiFoe, setMerakiFoe] = useState<MerakiChampion | null>(null)
  const [koNames, setKoNames] = useState<Record<string, string[]>>({})
  const [itemModsMe, setItemModsMe] = useState<ItemMods[]>([])
  const [itemModsFoe, setItemModsFoe] = useState<ItemMods[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [{ version: v, list }, { items: its }] = await Promise.all([
          fetchChampions(),
          fetchItems(),
        ])
        if (cancelled) return
        setVersion(v)
        setChamps(list)
        setItems(its)
        const garen = list.find((c) => c.id === 'Garen')
        const darius = list.find((c) => c.id === 'Darius')
        if (garen) setMe((s) => ({ ...s, champId: garen.id }))
        if (darius) setFoe((s) => ({ ...s, champId: darius.id }))
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : '로드 실패')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!me.champId || !foe.champId) return
      setBusy(true)
      setErr(null)
      try {
        const [mMe, mFoe, dMe, dFoe] = await Promise.all([
          fetchMerakiChampion(me.champId),
          fetchMerakiChampion(foe.champId),
          fetchChampionDetail(me.champId),
          fetchChampionDetail(foe.champId),
        ])
        if (cancelled) return
        setMerakiMe(mMe)
        setMerakiFoe(mFoe)
        setKoNames({
          [me.champId]: dMe.champ.spells.map((s) => s.name),
          [foe.champId]: dFoe.champ.spells.map((s) => s.name),
        })
      } catch (e) {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : '챔피언 데이터 실패')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [me.champId, foe.champId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const load = async (ids: string[]) => {
        const mods: ItemMods[] = []
        for (const id of ids) {
          const meraki = await fetchMerakiItem(id)
          if (meraki) mods.push(parseMerakiItemStats(meraki.stats))
          else if (items[id]) mods.push(parseDdItemStats(items[id].stats))
        }
        return mods
      }
      const [a, b] = await Promise.all([load(me.itemIds), load(foe.itemIds)])
      if (!cancelled) {
        setItemModsMe(a)
        setItemModsFoe(b)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [me.itemIds, foe.itemIds, items])

  const shop = useMemo(() => usableItems(items), [items])

  const myStats = merakiMe
    ? buildStats(merakiMe, me.level, sumItems(itemModsMe))
    : null
  const foeStats = merakiFoe
    ? buildStats(merakiFoe, foe.level, sumItems(itemModsFoe))
    : null

  if (loading) return <p className="loading">Data Dragon 패치 데이터 불러오는 중…</p>
  if (err && !champs.length) return <p className="error">{err}</p>

  return (
    <section className="panel combat-panel">
      <header className="panel-head">
        <h2>전투 계산</h2>
        <p>
          패치 <strong>{version}</strong> · Data Dragon(한글) + Meraki(스킬 수치).
          패시브·도트·특수한 상호작용은 단순화됨.
        </p>
      </header>

      <div className="sides">
        <SideEditor
          label="내 챔피언"
          side={me}
          setSide={setMe}
          champs={champs}
          version={version}
          shop={shop}
          accent="ally"
        />
        <SideEditor
          label="상대 챔피언"
          side={foe}
          setSide={setFoe}
          champs={champs}
          version={version}
          shop={shop}
          accent="enemy"
        />
      </div>

      {busy && <p className="loading">스킬 데이터 조회 중…</p>}
      {err && <p className="error">{err}</p>}

      {myStats && foeStats && merakiMe && (
        <div className="results">
          <div className="stat-strip">
            <StatBox title={`${champs.find((c) => c.id === me.champId)?.name ?? ''} (나)`} stats={myStats} />
            <StatBox title={`${champs.find((c) => c.id === foe.champId)?.name ?? ''} (상대)`} stats={foeStats} />
          </div>

          <h3>평타</h3>
          <div className="dmg-grid">
            {(() => {
              const n = autoAttackDamage(myStats, foeStats, me.level, false)
              const c = autoAttackDamage(myStats, foeStats, me.level, true)
              return (
                <>
                  <DmgCard
                    name="기본 공격"
                    raw={n.raw}
                    mitigated={n.mitigated}
                    meta={`공속 ${round1(myStats.as)}`}
                  />
                  <DmgCard
                    name="치명타 평타"
                    raw={c.raw}
                    mitigated={c.mitigated}
                    meta={`치명 ${round1(myStats.crit)}% · 배율 175%`}
                  />
                </>
              )
            })()}
          </div>

          <h3>스킬 피해 · 쿨타임</h3>
          <div className="skill-results">
            {(['Q', 'W', 'E', 'R'] as const).map((key, idx) => {
              const ability = merakiMe.abilities[key]?.[0]
              if (!ability) return null
              const rank = me.ranks[key]
              const cd = abilityCooldown(ability, rank, myStats.ah)
              const lines = calcAbilityDamage(
                ability,
                rank,
                myStats,
                foeStats,
                me.level,
              )
              const ko = koNames[me.champId]?.[idx] ?? ability.name
              return (
                <article key={key} className="skill-card">
                  <header>
                    <span className="key">{key}</span>
                    <strong>{ko}</strong>
                    <span className="rank">랭크 {rank}</span>
                    {cd != null && (
                      <span className="cd">쿨 {round1(cd)}초</span>
                    )}
                  </header>
                  {lines.length === 0 ? (
                    <p className="muted">수치형 피해 항목 없음 (유틸/특수 스킬)</p>
                  ) : (
                    <ul>
                      {lines.map((line) => (
                        <li key={line.attribute}>
                          <div className="line-top">
                            <span>{line.attribute}</span>
                            <span className={`kind ${line.kind}`}>{line.kind}</span>
                          </div>
                          <div className="line-nums">
                            <span>표기 {round0(line.raw)}</span>
                            <span className="actual">실제 ≈ {round0(line.mitigated)}</span>
                          </div>
                          <div className="line-parts">{line.parts.join(' + ')}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

function StatBox({
  title,
  stats,
}: {
  title: string
  stats: ReturnType<typeof buildStats>
}) {
  return (
    <div className="stat-box">
      <h4>{title}</h4>
      <dl>
        <div><dt>AD</dt><dd>{round0(stats.ad)}</dd></div>
        <div><dt>AP</dt><dd>{round0(stats.ap)}</dd></div>
        <div><dt>HP</dt><dd>{round0(stats.hp)}</dd></div>
        <div><dt>방어</dt><dd>{round0(stats.armor)}</dd></div>
        <div><dt>MR</dt><dd>{round0(stats.mr)}</dd></div>
        <div><dt>AH</dt><dd>{round0(stats.ah)}</dd></div>
      </dl>
    </div>
  )
}

function DmgCard({
  name,
  raw,
  mitigated,
  meta,
}: {
  name: string
  raw: number
  mitigated: number
  meta: string
}) {
  return (
    <div className="dmg-card">
      <strong>{name}</strong>
      <div className="nums">
        <span>표기 {round0(raw)}</span>
        <span className="actual">실제 ≈ {round0(mitigated)}</span>
      </div>
      <span className="meta">{meta}</span>
    </div>
  )
}

function SideEditor({
  label,
  side,
  setSide,
  champs,
  version,
  shop,
  accent,
}: {
  label: string
  side: SideState
  setSide: (s: SideState | ((prev: SideState) => SideState)) => void
  champs: DdChampSummary[]
  version: string
  shop: (DdItem & { id: string })[]
  accent: 'ally' | 'enemy'
}) {
  const champ = champs.find((c) => c.id === side.champId)
  const [itemQuery, setItemQuery] = useState('')
  const filtered = useMemo(() => {
    const q = itemQuery.trim().toLowerCase()
    const base = shop.filter((it) => !side.itemIds.includes(it.id))
    if (!q) return base.slice(0, 24)
    return base.filter((it) => it.name.toLowerCase().includes(q)).slice(0, 24)
  }, [shop, itemQuery, side.itemIds])

  return (
    <div className={`side-editor ${accent}`}>
      <h3>{label}</h3>
      <div className="champ-pick">
        {champ && (
          <img
            src={champIconUrl(version, champ.image.full)}
            alt={champ.name}
            width={56}
            height={56}
          />
        )}
        <label>
          챔피언
          <select
            value={side.champId}
            onChange={(e) =>
              setSide({ ...side, champId: e.target.value, itemIds: side.itemIds })
            }
          >
            {champs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          레벨
          <input
            type="number"
            min={1}
            max={18}
            value={side.level}
            onChange={(e) =>
              setSide({
                ...side,
                level: Math.min(18, Math.max(1, Number(e.target.value) || 1)),
              })
            }
          />
        </label>
      </div>

      <div className="ranks">
        {(['Q', 'W', 'E', 'R'] as const).map((k) => (
          <label key={k}>
            {k}
            <input
              type="number"
              min={1}
              max={k === 'R' ? 3 : 5}
              value={side.ranks[k]}
              onChange={(e) =>
                setSide({
                  ...side,
                  ranks: {
                    ...side.ranks,
                    [k]: Math.min(
                      k === 'R' ? 3 : 5,
                      Math.max(1, Number(e.target.value) || 1),
                    ),
                  },
                })
              }
            />
          </label>
        ))}
      </div>

      <div className="items-slot">
        <span className="label">아이템 ({side.itemIds.length}/6)</span>
        <div className="equipped">
          {side.itemIds.map((id) => {
            const it = shop.find((x) => x.id === id) ?? { id, name: id, image: { full: `${id}.png` } }
            return (
              <button
                key={id}
                type="button"
                className="item-chip"
                title="클릭하여 제거"
                onClick={() =>
                  setSide({
                    ...side,
                    itemIds: side.itemIds.filter((x) => x !== id),
                  })
                }
              >
                <img
                  src={itemIconUrl(version, it.image?.full ?? `${id}.png`)}
                  alt={it.name}
                  width={32}
                  height={32}
                />
                <span>{it.name}</span>
              </button>
            )
          })}
        </div>
        {side.itemIds.length < 6 && (
          <>
            <input
              value={itemQuery}
              onChange={(e) => setItemQuery(e.target.value)}
              placeholder="아이템 검색…"
            />
            <div className="item-pick">
              {filtered.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    setSide({ ...side, itemIds: [...side.itemIds, it.id] })
                    setItemQuery('')
                  }}
                >
                  <img
                    src={itemIconUrl(version, it.image.full)}
                    alt=""
                    width={28}
                    height={28}
                  />
                  {it.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
