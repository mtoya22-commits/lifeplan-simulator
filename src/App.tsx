import { useState } from 'react'
import { buildFullInputFromDetailed } from './domain/buildDetailed'
import { buildFullInput } from './domain/buildInput'
import { runSimulation } from './domain/simulation'
import type { DetailedAnswers, FullInput, QuickAnswers } from './domain/types'
import { DetailedDiagnosis } from './features/detailed/DetailedDiagnosis'
import { QuickDiagnosis } from './features/quick/QuickDiagnosis'
import { ResultDashboard } from './features/result/ResultDashboard'
import { useLocalStorage } from './hooks/useLocalStorage'

type Screen = 'home' | 'quick' | 'detailed' | 'result'

const QUICK_KEY = 'flpl.quick.v1'
const DETAILED_KEY = 'flpl.detailed.v1'

export default function App() {
  const [quickDraft, setQuickDraft, clearQuick] = useLocalStorage<Partial<QuickAnswers>>(QUICK_KEY, {})
  const [detailedDraft, setDetailedDraft, clearDetailed] = useLocalStorage<DetailedAnswers>(
    DETAILED_KEY,
    {},
  )
  const [screen, setScreen] = useState<Screen>('home')
  const [input, setInput] = useState<FullInput | null>(null)
  const [lastMode, setLastMode] = useState<'quick' | 'detailed'>('quick')

  const hasQuickDraft = Object.keys(quickDraft).length > 0

  function showResult(fi: FullInput, mode: 'quick' | 'detailed') {
    setInput(fi)
    setLastMode(mode)
    setScreen('result')
    window.scrollTo({ top: 0 })
  }

  if (screen === 'quick') {
    return (
      <QuickDiagnosis
        initial={quickDraft}
        onChange={setQuickDraft}
        onComplete={(a) => {
          setQuickDraft(a)
          showResult(buildFullInput(a), 'quick')
        }}
        onExit={() => setScreen('home')}
      />
    )
  }

  if (screen === 'detailed') {
    return (
      <DetailedDiagnosis
        initial={detailedDraft}
        onChange={setDetailedDraft}
        onComplete={(a) => {
          setDetailedDraft(a)
          showResult(buildFullInputFromDetailed(a), 'detailed')
        }}
        onExit={() => setScreen('home')}
      />
    )
  }

  if (screen === 'result' && input) {
    return (
      <ResultDashboard
        input={input}
        result={runSimulation(input)}
        onAdjust={() => setScreen(lastMode)}
        onDeepDive={() => setScreen('detailed')}
        showDeepDive={lastMode === 'quick'}
        onRestart={() => {
          clearQuick()
          clearDetailed()
          setInput(null)
          setScreen('home')
        }}
      />
    )
  }

  return (
    <div className="screen home">
      <div className="home-inner">
        <p className="home-eyebrow">fire-lifeplan-lab</p>
        <h1 className="home-title">
          お金と人生を、
          <br />
          ひとつの流れで見てみる。
        </h1>
        <p className="home-lead">
          住宅ローン・教育費・投資・FIRE・老後。
          バラバラに不安になりがちな未来を、ひとつのタイムラインで整理します。
        </p>

        <div className="home-actions">
          <button className="btn primary block" onClick={() => setScreen('quick')}>
            {hasQuickDraft ? 'ざっくり診断（前回の続きから）' : 'ざっくり診断をはじめる'}
          </button>
          <p className="home-note">30〜60秒・9問。まずは未来の方向性をつかみます。</p>

          <button className="btn ghost block deep" onClick={() => setScreen('detailed')}>
            しっかり診断を試す
          </button>
          <p className="home-note">
            分かる項目だけでOK。入力するほど精度が上がります。
          </p>
        </div>
      </div>
    </div>
  )
}
