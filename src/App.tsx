import { useMemo, useState } from 'react'
import { buildFullInput } from './domain/buildInput'
import { runSimulation } from './domain/simulation'
import type { QuickAnswers } from './domain/types'
import { QuickDiagnosis } from './features/quick/QuickDiagnosis'
import { ResultDashboard } from './features/result/ResultDashboard'
import { useLocalStorage } from './hooks/useLocalStorage'

type Screen = 'home' | 'quick' | 'result'

const STORAGE_KEY = 'flpl.quick.v1'

export default function App() {
  const [draft, setDraft, clearDraft] = useLocalStorage<Partial<QuickAnswers>>(STORAGE_KEY, {})
  const [screen, setScreen] = useState<Screen>('home')
  const [answers, setAnswers] = useState<QuickAnswers | null>(null)

  const hasDraft = Object.keys(draft).length > 0

  const computed = useMemo(() => {
    if (!answers) return null
    const input = buildFullInput(answers)
    return { input, result: runSimulation(input) }
  }, [answers])

  if (screen === 'quick') {
    return (
      <QuickDiagnosis
        initial={draft}
        onChange={setDraft}
        onComplete={(a) => {
          setAnswers(a)
          setDraft(a)
          setScreen('result')
        }}
        onExit={() => setScreen('home')}
      />
    )
  }

  if (screen === 'result' && computed) {
    return (
      <ResultDashboard
        input={computed.input}
        result={computed.result}
        onAdjust={() => setScreen('quick')}
        onRestart={() => {
          clearDraft()
          setAnswers(null)
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
          バラバラに不安になりがちな未来を、
          ひとつのタイムラインで整理します。
        </p>

        <div className="home-actions">
          <button className="btn primary block" onClick={() => setScreen('quick')}>
            {hasDraft ? '前回の続きから' : 'ざっくり診断をはじめる'}
          </button>
          {hasDraft && (
            <button
              className="link-btn center"
              onClick={() => {
                clearDraft()
              }}
            >
              最初からやり直す
            </button>
          )}
          <p className="home-note">30〜60秒・9問。未来を当てるのではなく、整理するための診断です。</p>
        </div>
      </div>
    </div>
  )
}
