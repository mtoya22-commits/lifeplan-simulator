import { useMemo, useState } from 'react'
import { buildFullInputFromDetailed } from './domain/buildDetailed'
import { buildFullInput } from './domain/buildInput'
import { runSimulation } from './domain/simulation'
import type { DetailedAnswers, FullInput, QuickAnswers, SimulationResult } from './domain/types'
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
  // 前回の結果（再シミュレーション時の差分表示に使う）
  const [previous, setPrevious] = useState<SimulationResult | null>(null)

  const hasQuickDraft = Object.keys(quickDraft).length > 0
  const result = useMemo(() => (input ? runSimulation(input) : null), [input])

  function showResult(fi: FullInput, mode: 'quick' | 'detailed') {
    setInput(fi)
    setLastMode(mode)
    setScreen('result')
    window.scrollTo({ top: 0 })
  }

  // 条件変更・深掘りへ移る前に、現在の結果を前回スナップショットとして保存
  function goAdjust(target: Screen) {
    setPrevious(result)
    setScreen(target)
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

  if (screen === 'result' && input && result) {
    return (
      <ResultDashboard
        input={input}
        result={result}
        previous={previous}
        onAdjust={() => goAdjust(lastMode)}
        onDeepDive={() => goAdjust('detailed')}
        showDeepDive={lastMode === 'quick'}
        onRestart={() => {
          clearQuick()
          clearDetailed()
          setInput(null)
          setPrevious(null)
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
