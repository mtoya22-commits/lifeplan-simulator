import type { EducationPolicy } from './types'

// 年齢区分ごとの教育費（万円/年）。共有メモ #14 の初期値に準拠。
const PRESCHOOL = 30 // 0〜5歳 未就学
const ELEMENTARY = 35 // 6〜11歳 小学校（公立）

const MIDDLE = { public: 55, private: 140 } // 12〜14歳
const HIGH = { public: 60, private: 120 } // 15〜17歳
// 18〜21歳 大学：種別×住まい
const UNIVERSITY = {
  liberal: { home: 120, alone: 240 }, // 文系
  science: { home: 160, alone: 280 }, // 理系
} as const

export type SchoolChoice = 'public' | 'private'
export type UniversityType = 'none' | 'liberal' | 'science' | 'undecided'
export type UniversityLiving = 'home' | 'alone' | 'undecided'

/** 子ども1人の教育プラン（現在年齢＋進路） */
export interface ChildEducation {
  age: number
  middle: SchoolChoice
  high: SchoolChoice
  university: UniversityType
  universityLiving: UniversityLiving
}

/** 教育方針（ざっくり診断のグローバル選択）から、子どものデフォルト進路を導く */
export function policyToProfile(policy: EducationPolicy): Omit<ChildEducation, 'age'> {
  switch (policy) {
    case 'public':
      return { middle: 'public', high: 'public', university: 'liberal', universityLiving: 'home' }
    case 'some_private':
      return { middle: 'public', high: 'private', university: 'liberal', universityLiving: 'home' }
    case 'focused':
      return { middle: 'private', high: 'private', university: 'science', universityLiving: 'alone' }
    case 'undecided':
      return { middle: 'public', high: 'public', university: 'undecided', universityLiving: 'undecided' }
  }
}

function universityCost(type: UniversityType, living: UniversityLiving): number {
  if (type === 'none') return 0
  // 未定は文系・自宅と一人暮らしの中間あたりを仮置き
  if (type === 'undecided' || living === 'undecided') {
    const liberalAvg = (UNIVERSITY.liberal.home + UNIVERSITY.liberal.alone) / 2
    const scienceAvg = (UNIVERSITY.science.home + UNIVERSITY.science.alone) / 2
    if (type === 'science') return living === 'home' ? UNIVERSITY.science.home : scienceAvg
    if (type === 'liberal') return living === 'home' ? UNIVERSITY.liberal.home : liberalAvg
    return (liberalAvg + scienceAvg) / 2 // 種別も未定
  }
  return UNIVERSITY[type][living]
}

/** 子ども1人・指定の経過年数後の年間教育費（万円） */
export function educationCostForChild(plan: ChildEducation, yearsElapsed: number): number {
  const age = plan.age + yearsElapsed
  if (age < 0) return 0
  if (age <= 5) return PRESCHOOL
  if (age <= 11) return ELEMENTARY
  if (age <= 14) return MIDDLE[plan.middle]
  if (age <= 17) return HIGH[plan.high]
  if (age <= 21) return universityCost(plan.university, plan.universityLiving)
  return 0 // 22歳以降は教育費なし
}

/** 全子どもの、指定の経過年数後の合計教育費（万円） */
export function totalEducationCost(plans: ChildEducation[], yearsElapsed: number): number {
  return plans.reduce((sum, plan) => sum + educationCostForChild(plan, yearsElapsed), 0)
}
