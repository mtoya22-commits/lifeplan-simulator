import { Suspense, lazy, useState } from 'react'
import { SOURCE_LABEL, type Field } from '../../domain/field'
import type { FullInput, SimulationResult } from '../../domain/types'
import { BottomSheet } from './BottomSheet'
import { Timeline } from './Timeline'
import { buildPoints } from './points'

// Recharts は重いので遅延読み込み（共有メモ：Recharts遅延読み込み）
const AssetChart = lazy(() => import('./AssetChart'))

interface Props {
  input: FullInput
  result: SimulationResult
  onAdjust: () => void
  onRestart: () => void
  onDeepDive: () => void
  showDeepDive: boolean
}

type SheetKey = null | 'cashflow' | 'assumptions'

export function ResultDashboard({
  input,
  result,
  onAdjust,
  onRestart,
  onDeepDive,
  showDeepDive,
}: Props) {
  const [sheet, setSheet] = useState<SheetKey>(null)
  const points = buildPoints(result)

  const longevityText = result.fireSuccess
    ? `${input.endAge.value}歳まで持続`
    : `${result.assetLongevity}歳ごろ`

  return (
    <div className="screen result">
      <header className="result-hero">
        <p className="hero-eyebrow">今回の条件ではこう見えます</p>
        <h1 className="hero-title">あなたの人生設計</h1>
      </header>

      <section className="metric-grid">
        <Metric
          label="FIRE達成度"
          value={`${result.fireAchievement}`}
          unit="%"
          tone={result.fireSuccess ? 'good' : 'caution'}
        />
        <Metric label="資産寿命" value={longevityText} />
        <Metric
          label={`${input.endAge.value}歳時点の資産`}
          value={formatMan(result.residualAtEnd)}
          tone={result.residualAtEnd >= 0 ? 'good' : 'caution'}
        />
      </section>

      <section className="card">
        <h2 className="card-title">今回のポイント</h2>
        <ul className="points">
          {points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="card-title">資産の推移</h2>
        <Suspense fallback={<div className="chart-fallback">グラフを準備しています…</div>}>
          <AssetChart rows={result.rows} events={result.lifeEvents} />
        </Suspense>
        <p className="card-hint">横軸は年齢です。節目のできごとを点線で示しています。</p>
      </section>

      <section className="card">
        <h2 className="card-title">人生タイムライン</h2>
        <Timeline events={result.lifeEvents} />
      </section>

      <section className="cta-block">
        <button className="btn primary block" onClick={onAdjust}>
          条件を変えてみる
        </button>
        <div className="cta-row">
          <button className="btn ghost" onClick={() => setSheet('assumptions')}>
            今回の試算条件
          </button>
          <button className="btn ghost" onClick={() => setSheet('cashflow')}>
            年ごとの収支
          </button>
        </div>
        {showDeepDive && (
          <button className="btn ghost block deep" onClick={onDeepDive}>
            しっかり診断で詳しく設計する
          </button>
        )}
        <button className="link-btn center" onClick={onRestart}>
          最初からやり直す
        </button>
        {showDeepDive && (
          <p className="deep-link">
            年齢別の教育費・住宅ローン・退職金などを入れると、より精密に試算できます。
          </p>
        )}
      </section>

      <BottomSheet open={sheet === 'assumptions'} title="今回の試算条件" onClose={() => setSheet(null)}>
        <AssumptionList input={input} />
      </BottomSheet>

      <BottomSheet open={sheet === 'cashflow'} title="年ごとの収支" onClose={() => setSheet(null)}>
        <CashflowTable result={result} />
      </BottomSheet>
    </div>
  )
}

function Metric({
  label,
  value,
  unit,
  tone,
}: {
  label: string
  value: string
  unit?: string
  tone?: 'good' | 'caution'
}) {
  return (
    <div className={`metric ${tone ?? ''}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </span>
    </div>
  )
}

function AssumptionList({ input }: { input: FullInput }) {
  const fields = Object.values(input) as Field<unknown>[]
  return (
    <ul className="assumption-list">
      {fields
        .filter((f) => f.assumptionText)
        .map((f) => (
          <li key={f.label}>
            <div className="assumption-row">
              <span className="assumption-label">{f.label}</span>
              <span className={`source-tag src-${f.source}`}>{SOURCE_LABEL[f.source]}</span>
            </div>
            <p className="assumption-text">{f.assumptionText}</p>
          </li>
        ))}
    </ul>
  )
}

function CashflowTable({ result }: { result: SimulationResult }) {
  // 5年刻みで間引いて表示（スマホで見やすく）
  const rows = result.rows.filter((r, i) => i === 0 || r.age % 5 === 0 || i === result.rows.length - 1)
  return (
    <table className="cashflow">
      <thead>
        <tr>
          <th>年齢</th>
          <th>収入</th>
          <th>支出</th>
          <th>うち教育</th>
          <th>資産</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.age}>
            <td>{r.age}</td>
            <td>{r.income}</td>
            <td>{r.expense}</td>
            <td>{r.education}</td>
            <td className={r.assets < 0 ? 'neg' : ''}>{r.assets}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function formatMan(v: number): string {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(2)}億円`
  return `${Math.round(v)}万円`
}
