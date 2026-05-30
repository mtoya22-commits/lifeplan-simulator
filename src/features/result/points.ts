import type { SimulationResult } from '../../domain/types'

/** 「今回のポイント」を煽らない文言で生成する（共有メモ #4 文言方針） */
export function buildPoints(result: SimulationResult): string[] {
  const points: string[] = []

  if (result.fireSuccess) {
    points.push('今回の条件では、95歳時点まで資産が持つ見込みです。')
  } else if (result.depletionAge !== null) {
    points.push(
      `今回の条件では、${result.depletionAge}歳ごろに資産の見直し余地がありそうです。`,
    )
  }

  if (result.educationPeakAge !== null && result.educationPeakAmount > 0) {
    points.push(
      `教育費のピークは${result.educationPeakAge}歳ごろ（年約${result.educationPeakAmount}万円）です。`,
    )
  }

  if (result.mortgagePayoffAge !== null) {
    points.push(`住宅ローンの完済目安は${result.mortgagePayoffAge}歳ごろです。`)
  }

  if (!result.fireSuccess) {
    points.push('働く期間や生活費を少し調整すると、見通しが改善しやすくなります。')
  } else {
    points.push('条件を変えて、より早い時期からのゆとりも試してみましょう。')
  }

  return points
}
