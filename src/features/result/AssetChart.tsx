import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { LifeEvent, YearRow } from '../../domain/types'

interface Props {
  rows: YearRow[]
  events: LifeEvent[]
}

// 投資分析チャートではなく「何歳頃に何が起きて資産がどう動くか」を見るためのもの。
// 横軸は年齢を主役にする。総資産1本でよい。
export default function AssetChart({ rows, events }: Props) {
  const markerEvents = events.filter((e) => e.type !== 'now' && e.type !== 'end')

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={rows} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="assetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b8def" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#5b8def" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eef0f4" vertical={false} />
          <XAxis
            dataKey="age"
            tickFormatter={(v) => `${v}歳`}
            tick={{ fontSize: 11, fill: '#9aa0b0' }}
            tickLine={false}
            axisLine={{ stroke: '#e6e8ee' }}
            minTickGap={36}
          />
          <YAxis
            width={46}
            tick={{ fontSize: 11, fill: '#9aa0b0' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatMan(v as number)}
          />
          <Tooltip
            formatter={(v) => [formatManFull(v as number), '資産']}
            labelFormatter={(age) => `${age}歳ごろ`}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e6e8ee',
              boxShadow: '0 4px 16px rgba(20,24,40,0.08)',
              fontSize: 12.5,
              padding: '8px 12px',
            }}
          />
          <ReferenceLine y={0} stroke="#d8b4b4" strokeDasharray="3 3" />
          {markerEvents.map((e, i) => (
            <ReferenceLine
              key={`${e.type}-${e.age}`}
              x={e.age}
              stroke="#ccd1dc"
              strokeDasharray="4 4"
              label={{
                value: e.label,
                position: 'top',
                // ラベル同士が重ならないよう上下2段に振り分ける
                dy: i % 2 === 0 ? 0 : -14,
                fontSize: 9.5,
                fill: '#8a90a0',
              }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="assets"
            stroke="#3b6fd4"
            strokeWidth={2.2}
            fill="url(#assetFill)"
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatMan(v: number): string {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}億`
  return `${Math.round(v).toLocaleString()}万`
}

function formatManFull(v: number): string {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(2)}億円`
  return `${Math.round(v).toLocaleString()}万円`
}
