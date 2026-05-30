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

/** 子どもの現在年齢を親年齢から推定する（共有メモ：ざっくり診断では子ども年齢を聞かない） */
function estimateChildrenAges(parentAge: number, count: number): number[] {
  if (count <= 0) return []
  // 第一子は親が約32歳のときに生まれたと仮定し、3歳間隔で配置。0歳未満にはしない。
  const firstChildAge = Math.max(0, parentAge - 32)
  return Array.from({ length: count }, (_, i) => Math.max(0, firstChildAge - i * 3))
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
  const childrenAges = estimateChildrenAges(answers.age, answers.childrenCount)
  const annualReturn = RETURN_BY_STYLE[answers.investStyle]
  const postFire = estimatePostFireIncome(answers)

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
    childrenAges: field(
      childrenAges,
      childrenAges.length ? 'recommended_value' : 'user_input',
      '子どもの年齢',
      childrenAges.length
        ? `人数から推定：${childrenAges.map((a) => `${a}歳`).join('・')}`
        : '子どもなし',
    ),
    educationPolicy: field(answers.educationPolicy, 'user_input', '教育方針'),
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
      postFire ? `おすすめ値 約${postFire}万円/月` : '完全リタイア（収入なし）',
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
  }
}
