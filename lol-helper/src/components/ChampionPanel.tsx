import { useEffect, useMemo, useState } from 'react'
import {
  champIconUrl,
  fetchChampionDetail,
  fetchChampions,
  passiveIconUrl,
  spellIconUrl,
  type DdChampDetail,
  type DdChampSummary,
} from '../lib/ddragon'

export function ChampionPanel() {
  const [version, setVersion] = useState('')
  const [list, setList] = useState<DdChampSummary[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('Garen')
  const [detail, setDetail] = useState<DdChampDetail | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetchChampions()
      .then(({ version: v, list: l }) => {
        setVersion(v)
        setList(l)
      })
      .catch((e) => setErr(e instanceof Error ? e.message : '로드 실패'))
  }, [])

  useEffect(() => {
    if (!selected) return
    setDetail(null)
    fetchChampionDetail(selected)
      .then(({ champ }) => setDetail(champ))
      .catch((e) => setErr(e instanceof Error ? e.message : '상세 실패'))
  }, [selected])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q),
    )
  }, [list, query])

  return (
    <section className="panel champ-panel">
      <header className="panel-head">
        <h2>챔피언 정보</h2>
        <p>Data Dragon 실시간 패치 데이터 (한글).</p>
      </header>

      {err && <p className="error">{err}</p>}

      <div className="champ-layout">
        <aside>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="챔피언 검색…"
          />
          <ul className="champ-list">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={c.id === selected ? 'active' : ''}
                  onClick={() => setSelected(c.id)}
                >
                  {version && (
                    <img
                      src={champIconUrl(version, c.image.full)}
                      alt=""
                      width={28}
                      height={28}
                    />
                  )}
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="champ-detail">
          {!detail && <p className="loading">불러오는 중…</p>}
          {detail && (
            <>
              <div className="detail-hero">
                {version && (
                  <img
                    src={champIconUrl(version, detail.image.full)}
                    alt={detail.name}
                    width={72}
                    height={72}
                  />
                )}
                <div>
                  <h3>{detail.name}</h3>
                  <p className="title">{detail.title}</p>
                  <p className="tags">{detail.tags.join(' · ')}</p>
                  <p className="patch">패치 {version}</p>
                </div>
              </div>

              <p className="blurb">{detail.blurb.replace(/<[^>]+>/g, '')}</p>

              <h4>기본 스탯 (1레벨)</h4>
              <dl className="base-stats">
                <div><dt>체력</dt><dd>{detail.stats.hp}</dd></div>
                <div><dt>AD</dt><dd>{detail.stats.attackdamage}</dd></div>
                <div><dt>방어</dt><dd>{detail.stats.armor}</dd></div>
                <div><dt>MR</dt><dd>{detail.stats.spellblock}</dd></div>
                <div><dt>공속</dt><dd>{detail.stats.attackspeed}</dd></div>
                <div><dt>사거리</dt><dd>{detail.stats.attackrange}</dd></div>
              </dl>

              <h4>스킬</h4>
              <div className="spell-list">
                <article>
                  {version && (
                    <img
                      src={passiveIconUrl(version, detail.passive.image.full)}
                      alt=""
                      width={40}
                      height={40}
                    />
                  )}
                  <div>
                    <strong>P · {detail.passive.name}</strong>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: detail.passive.description,
                      }}
                    />
                  </div>
                </article>
                {detail.spells.map((sp, i) => (
                  <article key={sp.id}>
                    {version && (
                      <img
                        src={spellIconUrl(version, sp.image.full)}
                        alt=""
                        width={40}
                        height={40}
                      />
                    )}
                    <div>
                      <strong>
                        {['Q', 'W', 'E', 'R'][i]} · {sp.name}
                      </strong>
                      <p className="cd-line">
                        쿨 {sp.cooldownBurn}초 · 비용 {sp.costBurn} · 사거리{' '}
                        {sp.rangeBurn}
                      </p>
                      <p
                        dangerouslySetInnerHTML={{ __html: sp.description }}
                      />
                    </div>
                  </article>
                ))}
              </div>

              {detail.allytips.length > 0 && (
                <>
                  <h4>아군 팁</h4>
                  <ul className="tips">
                    {detail.allytips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
              {detail.enemytips.length > 0 && (
                <>
                  <h4>상대 팁</h4>
                  <ul className="tips">
                    {detail.enemytips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
