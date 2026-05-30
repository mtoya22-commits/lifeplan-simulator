import type { SimulationResult } from '../../domain/types'

interface Props {
  previous: SimulationResult
  current: SimulationResult
  endAge: number
}

// 前回結果との差分（共有メモ #24 STEP9）。煽らず「変化」を淡々と見せる。
export function ScenarioDiff({ previous, current, endAge }: Props) {
  const rows = [
    diffRow('FIRE達成度', previous.fireAchievement, current.fireAchievement, {
      fmt: (v) => `${v}%`,
      deltaFmt: (v) => `${Math.round(v)}pt`,
    }),
    diffRow(
      '資産寿命',
      previous.fireSuccess ? endAge : previous.assetLongevity,
      current.fireSuccess ? endAge : current.assetLongevity,
      {
        fmt: (v) => (v >= endAge ? `${endAge}歳まで持続` : `${v}歳ごろ`),
        deltaFmt: (v) => `${Math.round(v)}年`,
      },
    ),
    diffRow(`${endAge}歳時点の資産`, previous.residualAtEnd, current.residualAtEnd, {
      fmt: formatMan,
      deltaFmt: formatMan,
    }),
  ]

  const anyChange = rows.some((r) => r.delta !== 0)

  return (
    <section className="card diff-card">
      <h2 className="card-title">前回からの変化</h2>
      {!anyChange ? (
        <p className="diff-none">前回と同じ結果です。条件を変えると変化が見られます。</p>
      ) : (
        <ul className="diff-list">
          {rows.map((r) => (
            <li key={r.label} className="diff-item">
              <span className="diff-label">{r.label}</span>
              <span className="diff-values">
                <span className="diff-prev">{r.prevText}</span>
                <span className="diff-arrow">→</span>
                <span className="diff-curr">{r.currText}</span>
                {r.delta !== 0 && (
                  <span className={`diff-badge ${r.tone}`}>
                    {r.delta > 0 ? '▲' : '▼'} {r.deltaText}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

interface Row {
  label: string
  prevText: string
  currText: string
  delta: number
  deltaText: string
  tone: 'up' | 'down'
}

function diffRow(
  label: string,
  prev: number,
  curr: number,
  opts: { fmt: (v: number) => string; deltaFmt: (v: number) => string },
): Row {
  const delta = curr - prev
  // いずれの指標も「大きいほど良い」ので、増加＝改善
  return {
    label,
    prevText: opts.fmt(prev),
    currText: opts.fmt(curr),
    delta,
    deltaText: opts.deltaFmt(Math.abs(delta)),
    tone: delta > 0 ? 'up' : 'down',
  }
}

function formatMan(v: number): string {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(2)}億円`
  return `${Math.round(v)}万円`
}
