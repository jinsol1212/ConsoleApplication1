import { useState } from 'react'
import { BasicsPanel } from './components/BasicsPanel'
import { ChampionPanel } from './components/ChampionPanel'
import { CombatPanel } from './components/CombatPanel'
import './App.css'

type Tab = 'basics' | 'combat' | 'champ'

const TABS: { id: Tab; label: string }[] = [
  { id: 'basics', label: '기본 상식' },
  { id: 'combat', label: '전투 계산' },
  { id: 'champ', label: '챔피언' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('basics')

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden />
      <header className="site-hero">
        <p className="brand">라인콜</p>
        <h1>협곡 타이밍과 숫자, 바로 확인.</h1>
        <p className="lede">
          실제 패치 데이터로 챔피언·아이템을 읽고, 스킬 쿨과 평타·스킬 실피해를
          계산합니다.
        </p>
        <nav className="tabs" aria-label="기능">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'basics' && <BasicsPanel />}
        {tab === 'combat' && <CombatPanel />}
        {tab === 'champ' && <ChampionPanel />}
      </main>

      <footer className="site-foot">
        데이터: Riot Data Dragon · Meraki Analytics. 비공식 팬 툴.
      </footer>
    </div>
  )
}
