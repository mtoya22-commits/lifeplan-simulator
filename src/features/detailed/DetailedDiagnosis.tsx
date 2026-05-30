import { useState } from 'react'
import { policyToProfile, type ChildEducation } from '../../domain/education'
import type { DetailedAnswers, EducationPolicy } from '../../domain/types'
import { DETAILED_SECTIONS, type DField } from './detailedQuestions'

interface Props {
  initial: DetailedAnswers
  onChange: (a: DetailedAnswers) => void
  onComplete: (a: DetailedAnswers) => void
  onExit: () => void
}

export function DetailedDiagnosis({ initial, onChange, onComplete, onExit }: Props) {
  const [section, setSection] = useState(0)
  const [answers, setAnswers] = useState<DetailedAnswers>(initial)
  const [openHelp, setOpenHelp] = useState<string | null>(null)

  const current = DETAILED_SECTIONS[section]
  const total = DETAILED_SECTIONS.length
  const isLast = section === total - 1

  function update(patch: Partial<DetailedAnswers>) {
    const next = { ...answers, ...patch }
    setAnswers(next)
    onChange(next)
  }

  function next() {
    if (!isLast) {
      setSection((s) => s + 1)
      setOpenHelp(null)
      window.scrollTo({ top: 0 })
    } else {
      onComplete(answers)
    }
  }
  function back() {
    if (section === 0) onExit()
    else {
      setSection((s) => s - 1)
      setOpenHelp(null)
      window.scrollTo({ top: 0 })
    }
  }

  const progress = Math.round(((section + 1) / total) * 100)

  return (
    <div className="screen">
      <header className="step-header">
        <button className="link-btn" onClick={back}>
          ‹ 戻る
        </button>
        <span className="step-count">
          {section + 1} / {total}
        </span>
      </header>

      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-note">分からない項目はスキップできます。入力した分だけ精度が上がります。</p>

      <div className="page-body">
        <h2 className="page-title">{current.title}</h2>
        {current.caption && <p className="section-caption">{current.caption}</p>}
        {current.fields.map((f) => (
          <DetailedField
            key={f.key}
            f={f}
            answers={answers}
            openHelp={openHelp === f.key}
            onToggleHelp={() => setOpenHelp((h) => (h === f.key ? null : f.key))}
            onChange={update}
          />
        ))}
      </div>

      <nav className="bottom-nav">
        <button className="btn ghost" onClick={next}>
          スキップ
        </button>
        <button className="btn primary" onClick={next}>
          {isLast ? '結果を見る' : '次へ'}
        </button>
      </nav>
    </div>
  )
}

interface FieldProps {
  f: DField
  answers: DetailedAnswers
  openHelp: boolean
  onToggleHelp: () => void
  onChange: (patch: Partial<DetailedAnswers>) => void
}

function DetailedField({ f, answers, openHelp, onToggleHelp, onChange }: FieldProps) {
  return (
    <div className="question">
      <div className="question-head">
        <label className="question-label">{f.label}</label>
        {f.help && (
          <button className="help-btn" onClick={onToggleHelp}>
            ?
          </button>
        )}
      </div>
      {openHelp && f.help && <p className="help-text">{f.help}</p>}

      {f.kind === 'number' && (
        <div className="number-row">
          <input
            className="number-input"
            type="number"
            inputMode="decimal"
            placeholder={f.placeholder}
            min={f.min}
            max={f.max}
            step={f.step}
            value={(answers[f.key] as number | undefined) ?? ''}
            onChange={(e) =>
              onChange({
                [f.key]: e.target.value === '' ? undefined : Number(e.target.value),
              } as Partial<DetailedAnswers>)
            }
          />
          {f.unit && <span className="unit">{f.unit}</span>}
          {f.recommended !== undefined && (
            <button
              className="chip"
              onClick={() => onChange({ [f.key]: f.recommended } as Partial<DetailedAnswers>)}
            >
              おすすめ {f.recommended}
            </button>
          )}
        </div>
      )}

      {f.kind === 'choice' && (
        <div className="choice-grid">
          {f.options.map((opt) => (
            <button
              key={opt.value}
              className={`choice-card ${answers[f.key] === opt.value ? 'selected' : ''}`}
              onClick={() => onChange({ [f.key]: opt.value } as Partial<DetailedAnswers>)}
            >
              <span className="choice-main">{opt.label}</span>
              {opt.sub && <span className="choice-sub">{opt.sub}</span>}
            </button>
          ))}
        </div>
      )}

      {f.kind === 'children' && (
        <ChildrenInput
          value={answers.childPlans ?? []}
          policy={answers.educationPolicy ?? 'undecided'}
          onChange={(plans) => onChange({ childPlans: plans })}
        />
      )}
    </div>
  )
}

interface ChildrenProps {
  value: ChildEducation[]
  policy: EducationPolicy
  onChange: (v: ChildEducation[]) => void
}

function ChildrenInput({ value, policy, onChange }: ChildrenProps) {
  function setCount(count: number) {
    const next = [...value]
    if (count < next.length) next.length = count
    else while (next.length < count) next.push({ age: 6, ...policyToProfile(policy) })
    onChange(next)
  }
  function patchChild(i: number, patch: Partial<ChildEducation>) {
    const next = value.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    onChange(next)
  }

  return (
    <div className="children-input">
      <div className="number-row">
        <span className="unit">人数</span>
        <div className="stepper">
          <button onClick={() => setCount(Math.max(0, value.length - 1))} aria-label="減らす">
            −
          </button>
          <span className="stepper-value">{value.length}</span>
          <button onClick={() => setCount(Math.min(5, value.length + 1))} aria-label="増やす">
            ＋
          </button>
        </div>
      </div>

      {value.map((child, i) => (
        <div className="child-card" key={i}>
          <div className="child-card-head">
            <span className="child-no">{i + 1}人目</span>
            <div className="child-age">
              <input
                className="number-input compact"
                type="number"
                inputMode="numeric"
                min={0}
                max={30}
                value={child.age}
                onChange={(e) => patchChild(i, { age: Number(e.target.value) })}
              />
              <span className="unit">歳</span>
            </div>
          </div>
          <Seg
            label="中学"
            value={child.middle}
            options={[
              ['public', '公立'],
              ['private', '私立'],
            ]}
            onChange={(v) => patchChild(i, { middle: v as ChildEducation['middle'] })}
          />
          <Seg
            label="高校"
            value={child.high}
            options={[
              ['public', '公立'],
              ['private', '私立'],
            ]}
            onChange={(v) => patchChild(i, { high: v as ChildEducation['high'] })}
          />
          <Seg
            label="大学"
            value={child.university}
            options={[
              ['none', 'なし'],
              ['liberal', '文系'],
              ['science', '理系'],
              ['undecided', '未定'],
            ]}
            onChange={(v) => patchChild(i, { university: v as ChildEducation['university'] })}
          />
          {child.university !== 'none' && (
            <Seg
              label="住まい"
              value={child.universityLiving}
              options={[
                ['home', '自宅'],
                ['alone', '一人暮らし'],
                ['undecided', '未定'],
              ]}
              onChange={(v) =>
                patchChild(i, { universityLiving: v as ChildEducation['universityLiving'] })
              }
            />
          )}
        </div>
      ))}
    </div>
  )
}

function Seg({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: [string, string][]
  onChange: (v: string) => void
}) {
  return (
    <div className="seg-row">
      <span className="seg-label">{label}</span>
      <div className="seg">
        {options.map(([v, l]) => (
          <button key={v} className={`seg-btn ${value === v ? 'on' : ''}`} onClick={() => onChange(v)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}
