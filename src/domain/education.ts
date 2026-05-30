import type { EducationPolicy } from './types'

// 年齢区分ごとの教育費（万円/年）。共有メモ #14 の初期値に準拠。
const PRESCHOOL = 30 // 0〜5歳 未就学
const ELEMENTARY = 35 // 6〜11歳 小学校（公立）

interface Stage {
  middle: number // 12〜14歳
  high: number // 15〜17歳
  university: number // 18〜21歳
}

// 教育方針ごとの中学・高校・大学の費用。
const POLICY_TABLE: Record<EducationPolicy, Stage> = {
  // 公立中心：中学公立 / 高校公立 / 大学 文系自宅
  public: { middle: 55, high: 60, university: 120 },
  // 一部私立：中学公立 / 高校私立 / 大学 文系自宅
  some_private: { middle: 55, high: 120, university: 120 },
  // 教育重視：中学私立 / 高校私立 / 大学 理系一人暮らし
  focused: { middle: 140, high: 120, university: 280 },
  // 未定：一部私立相当を仮置き
  undecided: { middle: 55, high: 90, university: 160 },
}

/** 子ども1人・指定年齢の年間教育費（万円） */
export function educationCostForChild(age: number, policy: EducationPolicy): number {
  const stage = POLICY_TABLE[policy]
  if (age < 0) return 0
  if (age <= 5) return PRESCHOOL
  if (age <= 11) return ELEMENTARY
  if (age <= 14) return stage.middle
  if (age <= 17) return stage.high
  if (age <= 21) return stage.university
  return 0 // 22歳以降は教育費なし
}

/** 全子どもの、指定の経過年数後の合計教育費（万円） */
export function totalEducationCost(
  childrenCurrentAges: number[],
  yearsElapsed: number,
  policy: EducationPolicy,
): number {
  return childrenCurrentAges.reduce(
    (sum, base) => sum + educationCostForChild(base + yearsElapsed, policy),
    0,
  )
}
