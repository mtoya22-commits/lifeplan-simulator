import { policyToProfile, type ChildEducation } from './education'
import { field } from './field'
import type { FullInput, InvestStyle, QuickAnswers } from './types'

const END_AGE = 95
const PENSION_START_AGE = 65

// 投資スタイルごとの想定利回り（年・小数）
const RETURN_BY_STYLE: Record<InvestStyle, number> = {
  stable: 0.025,
  balanced: 0.04,
  growth: 0.055,
}

/** 住まいの種別から毎月の住居費（万円/月）とローン残年数を推定 */
function estimateHousing(answers: QuickAnswers): { monthly: number; loanYears: number } {
  switch (answers.housing) {
    case 'own':
      // 持ち家：ローン返済中と仮定。残年数は年齢から概算。
      return { monthly: 10, loanYears: Math.max(0, Math.min(30, 60 - answers.age)) }
    case 'rent':
      return { monthly: 11, loanYears: 0 }
    case 'considering':
      // 購入検討中：現状賃貸→将来ローン相当を仮置き
      return { monthly: 11, loanYears: 30 }
  }
}

/** 子ども人数と教育方針から、子どもごとの教育プランを推定 */
function buildChildPlans(answers: QuickAnswers): ChildEducation[] {
  if (answers.childrenCount <= 0) return []
  const profile = policyToProfile(answers.educationPolicy)
  const firstChildAge = Math.max(0, answers.age - 32)
  return Array.from({ length: answers.childrenCount }, (_, i) => ({
    age: Math.max(0, firstChildAge - i * 3),
    ...profile,
  }))
}

/** 世帯年収から毎月生活費（万円/月）を概算。子ども数で少し加算。 */
function estimateMonthlyLiving(answers: QuickAnswers): number {
  const base = 24
  return base + answers.childrenCount * 2
}

/** サイドFIRE後の毎月労働収入（万円/月）を働き方から推定 */
function estimatePostFireIncome(answers: QuickAnswers): number {
  switch (answers.workStyle) {
    case 'full_retire':
      return 0
    case 'side_fire':
      return 12 // 少し働く想定
    case 'undecided':
      return 6 // 中間
  }
}

/**
 * ざっくり診断の回答を、共通入力 FullInput に変換する。
 * ユーザーが答えた項目は user_input、推定で補った項目は recommended/default。
 */
export function buildFullInput(answers: QuickAnswers): FullInput {
  const housing = estimateHousing(answers)
  const monthlyLiving = estimateMonthlyLiving(answers)
  const childPlans = buildChildPlans(answers)
  const annualReturn = RETURN_BY_STYLE[answers.investStyle]
  const postFire = estimatePostFireIncome(answers)
  // ざっくり診断ではローン残高・金利は概算（残年数×毎月返済額から残高を逆算）
  const loanBalance = housing.loanYears > 0 ? Math.round(housing.monthly * 12 * housing.loanYears) : 0

  return {
    currentAge: field(answers.age, 'user_input', '現在の年齢', `${answers.age}歳`),
    endAge: field(END_AGE, 'default_value', '試算終了年齢', `${END_AGE}歳まで試算`),
    householdIncome: field(
      answers.householdIncome,
      'user_input',
      '世帯年収',
      `額面 ${answers.householdIncome}万円/年`,
    ),
    currentAssets: field(
      answers.currentAssets,
      'user_input',
      '現在の資産',
      `${answers.currentAssets}万円`,
    ),
    monthlyLivingCost: field(
      monthlyLiving,
      'recommended_value',
      '毎月の生活費',
      `おすすめ値 約${monthlyLiving}万円/月（子ども人数から概算）`,
    ),
    childPlans: field(
      childPlans,
      childPlans.length ? 'recommended_value' : 'user_input',
      '子どもの教育',
      childPlans.length
        ? `${childPlans.length}人・教育方針から推定（年齢: ${childPlans.map((c) => `${c.age}歳`).join('・')}）`
        : '子どもなし',
    ),
    housingType: field(answers.housing, 'user_input', '住まい'),
    monthlyHousingCost: field(
      housing.monthly,
      'recommended_value',
      '毎月の住居費',
      `おすすめ値 約${housing.monthly}万円/月`,
    ),
    loanRemainingYears: field(
      housing.loanYears,
      'recommended_value',
      '住宅ローン残年数',
      housing.loanYears ? `残り約${housing.loanYears}年と仮定` : 'ローンなし',
    ),
    loanBalance: field(
      loanBalance,
      'recommended_value',
      'ローン残高',
      loanBalance ? `概算 約${loanBalance}万円` : 'ローンなし',
    ),
    loanRatePct: field(1.0, 'default_value', '住宅ローン金利', '標準値 年1.0%'),
    loanInterestType: field('variable', 'default_value', '金利タイプ', '標準値 変動金利'),
    fixedPeriodEndYears: field(0, 'default_value', '固定期間終了', 'ざっくり診断では考慮しません'),
    workStyle: field(answers.workStyle, 'user_input', '将来の働き方'),
    fireAge: field(
      answers.reduceWorkAge,
      'user_input',
      '仕事を減らす年齢',
      `${answers.reduceWorkAge}歳`,
    ),
    postFireMonthlyIncome: field(
      postFire,
      'recommended_value',
      'FIRE後の毎月収入',
      postFire ? `おすすめ値 約${postFire}万円/月（年金開始まで）` : '完全リタイア（収入なし）',
    ),
    annualReturn: field(
      annualReturn,
      'recommended_value',
      '想定利回り',
      `投資スタイルから 年${(annualReturn * 100).toFixed(1)}%`,
    ),
    pensionAnnual: field(180, 'default_value', '年金見込み', '標準値 約180万円/年'),
    pensionStartAge: field(
      PENSION_START_AGE,
      'default_value',
      '年金開始年齢',
      `${PENSION_START_AGE}歳から`,
    ),
    retireAge: field(answers.reduceWorkAge, 'default_value', '退職予定年齢', '仕事を減らす年齢と同じと仮定'),
    retirementLumpSum: field(0, 'default_value', '退職金見込み', 'ざっくり診断では考慮しません'),
    oldAgeMonthlyLivingCost: field(
      Math.round(monthlyLiving * 0.85),
      'recommended_value',
      '老後の生活費',
      `おすすめ値 約${Math.round(monthlyLiving * 0.85)}万円/月（現役期の約85%）`,
    ),
    medicalCareReserve: field(0, 'default_value', '医療介護予備費', 'ざっくり診断では考慮しません'),
  }
}
