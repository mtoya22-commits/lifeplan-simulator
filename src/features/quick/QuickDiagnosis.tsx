import { useMemo, useState } from 'react'
import type { QuickAnswers } from '../../domain/types'
import { DEFAULT_QUICK_ANSWERS, QUICK_PAGES, type Question } from './questions'

interface Props {
  initial: Partial<QuickAnswers>
  onChange: (answers: Partial<QuickAnswers>) => void
  onComplete: (answers: QuickAnswers) => void
  onExit: () => void
}

export function QuickDiagnosis({ initial, onChange, onComplete, onExit }: Props) {
  const [page, setPage] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuickAnswers>>(initial)
  const [openHelp, setOpenHelp] = useState<string | null>(null)

  const current = QUICK_PAGES[page]
  const totalQuestions = QUICK_PAGES.reduce((n, p) => n + p.questions.length, 0)
  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => v !== undefined && (v as unknown) !== '').length,
    [answers],
  )

  function update(patch: Partial<QuickAnswers>) {
    const next = { ...answers, ...patch }
    setAnswers(next)
    onChange(next)
  }

  // 現在ページの必須が埋まっているか（recommended のある数値はスキップ可）
  const canProceed = current.questions.every((q) => {
    const v = answers[q.key]
    if (v !== undefined && (v as unknown) !== '') return true
    return q.kind === 'number' && q.recommended !== undefined
  })

  function next() {
    if (page < QUICK_PAGES.length - 1) {
      setPage((p) => p + 1)
      setOpenHelp(null)
      window.scrollTo({ top: 0 })
    } else {
      onComplete({ ...DEFAULT_QUICK_ANSWERS, ...answers })
    }
  }

  function back() {
    if (page === 0) {
      onExit()
    } else {
      setPage((p) => p - 1)
      setOpenHelp(null)
      window.scrollTo({ top: 0 })
    }
  }

  const progress = Math.round(((page + 1) / QUICK_PAGES.length) * 100)
  const remaining = totalQuestions - answeredCount
  const isLast = page === QUICK_PAGES.length - 1

  return (
    <div className="screen">
      <header className="step-header">
        <button className="link-btn" onClick={back} aria-label="戻る">
          ‹ 戻る
        </button>
        <span className="step-count">
          {page + 1} / {QUICK_PAGES.length}
        </span>
      </header>

      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-note">
        あと約{Math.max(0, remaining)}問・1分ほどで終わります
      </p>

      <div className="page-body">
        <h2 className="page-title">{current.title}</h2>
        {current.questions.map((q) => (
          <QuestionView
            key={q.key}
            q={q}
            value={answers[q.key]}
            openHelp={openHelp === q.key}
            onToggleHelp={() => setOpenHelp((h) => (h === q.key ? null : q.key))}
            onChange={(v) => update({ [q.key]: v } as Partial<QuickAnswers>)}
          />
        ))}
      </div>

      <nav className="bottom-nav">
        <button className="btn ghost" onClick={back}>
          {page === 0 ? 'やめる' : '戻る'}
        </button>
        <button className="btn primary" onClick={next} disabled={!canProceed}>
          {isLast ? '結果を見る' : '次へ'}
        </button>
      </nav>
    </div>
  )
}

interface QVProps {
  q: Question
  value: unknown
  openHelp: boolean
  onToggleHelp: () => void
  onChange: (v: number | string) => void
}

function QuestionView({ q, value, openHelp, onToggleHelp, onChange }: QVProps) {
  return (
    <div className="question">
      <div className="question-head">
        <label className="question-label">{q.label}</label>
        {q.help && (
          <button className="help-btn" onClick={onToggleHelp} aria-label="ヘルプ">
            ?
          </button>
        )}
      </div>
      {openHelp && q.help && <p className="help-text">{q.help}</p>}

      {q.kind === 'number' ? (
        <div className="number-row">
          <input
            className="number-input"
            type="number"
            inputMode="numeric"
            placeholder={q.placeholder}
            min={q.min}
            max={q.max}
            step={q.step}
            value={value === undefined ? '' : (value as number)}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          />
          {q.unit && <span className="unit">{q.unit}</span>}
          {q.recommended !== undefined && (
            <button className="chip" onClick={() => onChange(q.recommended as number)}>
              おすすめ {q.recommended}
            </button>
          )}
        </div>
      ) : (
        <div className="choice-grid">
          {q.options.map((opt) => (
            <button
              key={opt.value}
              className={`choice-card ${value === opt.value ? 'selected' : ''}`}
              onClick={() => onChange(opt.value)}
            >
              <span className="choice-main">{opt.label}</span>
              {opt.sub && <span className="choice-sub">{opt.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
