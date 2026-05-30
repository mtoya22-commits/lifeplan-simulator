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
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="assetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b8def" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#5b8def" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eceef2" vertical={false} />
          <XAxis
            dataKey="age"
            tickFormatter={(v) => `${v}`}
            tick={{ fontSize: 11, fill: '#8a90a0' }}
            tickLine={false}
            axisLine={{ stroke: '#e4e7ec' }}
            minTickGap={28}
          />
          <YAxis
            width={44}
            tick={{ fontSize: 11, fill: '#8a90a0' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatMan(v as number)}
          />
          <Tooltip
            formatter={(v) => [`${formatMan(v as number)}`, '資産']}
            labelFormatter={(age) => `${age}歳`}
            contentStyle={{ borderRadius: 12, border: '1px solid #e4e7ec', fontSize: 12 }}
          />
          <ReferenceLine y={0} stroke="#d0a0a0" strokeDasharray="3 3" />
          {markerEvents.map((e) => (
            <ReferenceLine
              key={`${e.type}-${e.age}`}
              x={e.age}
              stroke="#c8cdd8"
              strokeDasharray="4 4"
              label={{ value: e.label, position: 'top', fontSize: 9, fill: '#9aa0b0' }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="assets"
            stroke="#3b6fd4"
            strokeWidth={2}
            fill="url(#assetFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatMan(v: number): string {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}億`
  return `${Math.round(v)}万`
}
