import { useMemo, useState } from 'react'
import { BASICS, searchBasics, type BasicsEntry } from '../lib/basics'

function renderBody(text: string) {
  return text.split('\n').map((line, i) => {
    const html = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
    return (
      <p
        key={i}
        className={line.startsWith('- ') ? 'bullet' : undefined}
        dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }}
      />
    )
  })
}

export function BasicsPanel() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchBasics(query), [query])
  const [openId, setOpenId] = useState<string | null>('top-lv2')

  const quick = ['탑 2렙', '탑 3렙', '웨이브', '스킬가속', '방어력']

  return (
    <section className="panel basics-panel">
      <header className="panel-head">
        <h2>기본 상식</h2>
        <p>라인 타이밍·XP·전투 공식. 실제 패치 수치는 클라이언트 기준으로 확인할 것.</p>
      </header>

      <div className="search-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 탑 2렙 타이밍, 쿨감, 웨이브…"
          aria-label="상식 검색"
        />
        <div className="chips">
          {quick.map((q) => (
            <button key={q} type="button" className="chip" onClick={() => setQuery(q)}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="basics-list">
        {results.map((entry: BasicsEntry) => {
          const open = openId === entry.id
          return (
            <article key={entry.id} className={`basics-card ${open ? 'open' : ''}`}>
              <button
                type="button"
                className="basics-q"
                onClick={() => setOpenId(open ? null : entry.id)}
                aria-expanded={open}
              >
                <span>{entry.title}</span>
                <span className="tags">
                  {entry.tags.map((t) => (
                    <em key={t}>{t}</em>
                  ))}
                </span>
              </button>
              {open && <div className="basics-a">{renderBody(entry.body)}</div>}
            </article>
          )
        })}
        {results.length === 0 && (
          <p className="empty">검색 결과 없음. 다른 키워드 시도.</p>
        )}
      </div>

      {!query && (
        <p className="hint-foot">
          전체 {BASICS.length}개 항목. 전투 수치 계산은 &quot;전투 계산&quot; 탭.
        </p>
      )}
    </section>
  )
}
