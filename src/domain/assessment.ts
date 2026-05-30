import { runSimulation } from './simulation'
import type { FullInput, SimulationResult } from './types'

// 総合判定。文言は煽らない方針（共有メモ #4）。
export type AssessmentLevel = 'stable' | 'attention' | 'review'

export interface Assessment {
  level: AssessmentLevel
  label: string // 安定 / やや注意 / 見直し余地あり
  message: string
}

export function assess(result: SimulationResult): Assessment {
  if (result.fireSuccess && result.fireAchievement >= 100) {
    if (result.residualAtEnd >= 2000) {
      return {
        level: 'stable',
        label: '安定',
        message: '今回の条件では、最後までゆとりを持って資産が続く見通しです。',
      }
    }
    return {
      level: 'stable',
      label: '安定',
      message: '今回の条件では、最後まで資産が続く見通しです。',
    }
  }
  if (result.depletionAge !== null && result.depletionAge >= 85) {
    return {
      level: 'attention',
      label: 'やや注意',
      message: `終盤（${result.depletionAge}歳ごろ）に資産の見直し余地がありそうです。少しの調整で改善しやすい範囲です。`,
    }
  }
  return {
    level: 'review',
    label: '見直し余地あり',
    message: `${result.depletionAge ?? ''}歳ごろに資産が不足しやすい見通しです。条件を調整すると改善できる可能性があります。`,
  }
}

export interface Suggestion {
  title: string
  detail: string
}

/** 改善の度合い：資産が尽きないことを最優先、その後に残資産の多さで比較 */
function score(r: SimulationResult): number {
  // 持続するなら大きなボーナス + 残資産。しないなら資産寿命を重視。
  return (r.fireSuccess ? 1_000_000 : 0) + r.assetLongevity * 1000 + r.residualAtEnd
}

/** フィールド値を差し替えた入力を作る（再シミュレーション用） */
function tweak(input: FullInput, key: keyof FullInput, transform: (v: number) => number): FullInput {
  const f = input[key] as { value: number }
  return { ...input, [key]: { ...f, value: transform(f.value) } }
}

interface Lever {
  build: (input: FullInput) => FullInput
  title: string
}

/**
 * 改善提案（見直しヒント）。いくつかの調整を実際に再計算し、
 * 効果があったものだけを効果の大きい順に返す（共有メモ #8 STEP8）。
 */
export function buildSuggestions(input: FullInput, base: SimulationResult): Suggestion[] {
  const baseScore = score(base)

  const levers: Lever[] = [
    {
      title: `仕事を減らす年齢を ${input.fireAge.value}歳 → ${input.fireAge.value + 3}歳 に`,
      build: (i) => tweak(i, 'fireAge', (v) => v + 3),
    },
    {
      title: '毎月の生活費を 2万円 見直す',
      build: (i) => tweak(i, 'monthlyLivingCost', (v) => Math.max(0, v - 2)),
    },
    {
      title: 'FIRE後に 月3万円 ほど多く働く',
      build: (i) => tweak(i, 'postFireMonthlyIncome', (v) => v + 3),
    },
    {
      title: '老後の生活費を 1万円 見直す',
      build: (i) => tweak(i, 'oldAgeMonthlyLivingCost', (v) => Math.max(0, v - 1)),
    },
  ]

  const suggestions = levers
    .map((lever) => {
      const r = runSimulation(lever.build(input))
      return { lever, result: r, gain: score(r) - baseScore }
    })
    .filter((x) => x.gain > 0)
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 3)
    .map(({ lever, result }) => ({
      title: lever.title,
      detail: describe(base, result),
    }))

  return suggestions
}

function describe(base: SimulationResult, next: SimulationResult): string {
  if (!base.fireSuccess && next.fireSuccess) {
    return '95歳まで資産が続く見通しに変わります。'
  }
  if (!base.fireSuccess && !next.fireSuccess && next.assetLongevity > base.assetLongevity) {
    return `資産寿命が ${base.assetLongevity}歳 → ${next.assetLongevity}歳 ごろに延びます。`
  }
  const diff = Math.round(next.residualAtEnd - base.residualAtEnd)
  return `95歳時点の資産が 約${diff.toLocaleString()}万円 増える見通しです。`
}
