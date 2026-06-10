import { field, type Field, type FieldSource } from './field'
import type { DetailedAnswers, FullInput, HousingType, WorkStyle } from './types'

const END_AGE = 95
const PENSION_START_AGE = 65

/**
 * ユーザー入力があれば user_input、なければ fallback（おすすめ／標準値）を採用する。
 * しっかり診断の「入力した分だけ精度が上がる」を source として表現する。
 */
function pick<T>(
  userValue: T | undefined,
  fallback: T,
  fallbackSource: Exclude<FieldSource, 'user_input'>,
  label: string,
  userText: (v: T) => string,
  fallbackText: string,
): Field<T> {
  if (userValue !== undefined && (userValue as unknown) !== '') {
    return field(userValue, 'user_input', label, userText(userValue))
  }
  return field(fallback, fallbackSource, label, fallbackText)
}

/** しっかり診断の回答を共通入力 FullInput に変換する。 */
export function buildFullInputFromDetailed(a: DetailedAnswers): FullInput {
  const age = a.age ?? 40
  const childCount = a.childPlans?.length ?? 0
  const housing: HousingType = a.housing ?? 'own'
  const workStyle: WorkStyle = a.workStyle ?? 'side_fire'
  const fireAge = a.fireAge ?? 55

  const defaultLoanYears =
    housing === 'own' ? Math.max(0, Math.min(30, 60 - age)) : housing === 'considering' ? 30 : 0
  const defaultPostFire = workStyle === 'full_retire' ? 0 : workStyle === 'side_fire' ? 12 : 6
  const annualReturn = a.annualReturnPct !== undefined ? a.annualReturnPct / 100 : 0.04

  return {
    currentAge: pick(a.age, 40, 'default_value', '現在の年齢', (v) => `${v}歳`, '標準値 40歳'),
    endAge: field(END_AGE, 'default_value', '試算終了年齢', `${END_AGE}歳まで試算`),
    householdIncome: pick(
      a.householdIncome,
      800,
      'default_value',
      '世帯年収',
      (v) => `額面 ${v}万円/年`,
      '標準値 800万円/年',
    ),
    currentAssets: pick(
      a.currentAssets,
      1000,
      'default_value',
      '現在の資産',
      (v) => `${v}万円`,
      '標準値 1000万円',
    ),
    monthlyLivingCost: pick(
      a.monthlyLivingCost,
      24 + childCount * 2,
      'recommended_value',
      '毎月の生活費',
      (v) => `${v}万円/月`,
      `おすすめ値 約${24 + childCount * 2}万円/月`,
    ),
    childPlans: pick(
      a.childPlans && a.childPlans.length ? a.childPlans : undefined,
      [],
      'default_value',
      '子どもの教育',
      (v) => `${v.length}人・進路を個別に設定（年齢: ${v.map((c) => `${c.age}歳`).join('・')}）`,
      '子どもなしとして試算',
    ),
    housingType: pick(a.housing, 'own', 'default_value', '住まい', () => '入力あり', '標準値 持ち家'),
    monthlyHousingCost: pick(
      a.monthlyHousingCost,
      housing === 'rent' || housing === 'considering' ? 11 : 10,
      'recommended_value',
      '毎月の住居費',
      (v) => `${v}万円/月`,
      'おすすめ値で補完',
    ),
    loanRemainingYears: pick(
      a.loanRemainingYears,
      defaultLoanYears,
      'recommended_value',
      '住宅ローン残年数',
      (v) => (v ? `残り${v}年` : 'ローンなし'),
      defaultLoanYears ? `残り約${defaultLoanYears}年と仮定` : 'ローンなし',
    ),
    loanBalance: pick(
      a.loanBalance,
      0,
      'default_value',
      'ローン残高',
      (v) => (v ? `${v}万円` : 'ローンなし'),
      '未入力',
    ),
    loanRatePct: pick(
      a.loanRatePct,
      1.0,
      'recommended_value',
      '住宅ローン金利',
      (v) => `年${v}%`,
      'おすすめ値 年1.0%',
    ),
    loanInterestType: pick(
      a.loanInterestType,
      'variable',
      'default_value',
      '金利タイプ',
      (v) => (v === 'fixed' ? '固定金利' : '変動金利'),
      '標準値 変動金利',
    ),
    fixedPeriodEndYears: pick(
      a.fixedPeriodEndYears,
      0,
      'default_value',
      '固定期間終了',
      (v) => (v ? `${v}年後` : 'なし'),
      '未入力',
    ),
    workStyle: pick(
      a.workStyle,
      'side_fire',
      'default_value',
      '将来の働き方',
      () => '入力あり',
      '標準値 サイドFIRE',
    ),
    fireAge: pick(a.fireAge, 55, 'default_value', '仕事を減らす年齢', (v) => `${v}歳`, '標準値 55歳'),
    postFireMonthlyIncome: pick(
      a.postFireMonthlyIncome,
      defaultPostFire,
      'recommended_value',
      'FIRE後の毎月収入',
      (v) => `${v}万円/月（年金開始まで）`,
      defaultPostFire
        ? `おすすめ値 約${defaultPostFire}万円/月（年金開始まで）`
        : '完全リタイア（収入なし）',
    ),
    annualReturn: pick(
      a.annualReturnPct !== undefined ? annualReturn : undefined,
      0.04,
      'recommended_value',
      '想定利回り',
      (v) => `年${(v * 100).toFixed(1)}%`,
      'おすすめ値 年4.0%',
    ),
    pensionAnnual: pick(
      a.pensionAnnual,
      180,
      'default_value',
      '年金見込み',
      (v) => `約${v}万円/年`,
      '標準値 約180万円/年',
    ),
    pensionStartAge: pick(
      a.pensionStartAge,
      PENSION_START_AGE,
      'default_value',
      '年金開始年齢',
      (v) => `${v}歳から`,
      `標準値 ${PENSION_START_AGE}歳から`,
    ),
    retireAge: pick(
      a.retireAge,
      fireAge,
      'recommended_value',
      '退職予定年齢',
      (v) => `${v}歳`,
      '仕事を減らす年齢と同じと仮定',
    ),
    retirementLumpSum: pick(
      a.retirementLumpSum,
      0,
      'default_value',
      '退職金見込み',
      (v) => (v ? `${v}万円` : 'なし'),
      '未入力（考慮しません）',
    ),
    oldAgeMonthlyLivingCost: pick(
      a.oldAgeMonthlyLivingCost,
      Math.round((a.monthlyLivingCost ?? 26) * 0.85),
      'recommended_value',
      '老後の生活費',
      (v) => `${v}万円/月`,
      `おすすめ値 約${Math.round((a.monthlyLivingCost ?? 26) * 0.85)}万円/月（現役期の約85%）`,
    ),
    medicalCareReserve: pick(
      a.medicalCareReserve,
      0,
      'default_value',
      '医療介護予備費',
      (v) => (v ? `${v}万円（80歳時）` : 'なし'),
      '未入力',
    ),
  }
}
