import { totalEducationCost } from './education'
import type { FullInput, LifeEvent, SimulationResult, YearRow } from './types'

/** 額面年収から手取りを概算（30〜40代世帯の簡易係数） */
function takeHome(gross: number): number {
  return gross * 0.78
}

/**
 * 年次シミュレーション。
 * ざっくり診断・しっかり診断とも、最終的にこの同じロジックに流す。
 * FIRE の違いは「年間労働収入」だけ（共有メモ #13）。
 */
export function runSimulation(input: FullInput): SimulationResult {
  const currentAge = input.currentAge.value
  const endAge = input.endAge.value
  const fireAge = input.fireAge.value
  const workStyle = input.workStyle.value
  const annualReturn = input.annualReturn.value
  const baseYear = new Date().getFullYear()

  const householdNet = takeHome(input.householdIncome.value)
  const postFireAnnual = input.postFireMonthlyIncome.value * 12
  const livingAnnual = input.monthlyLivingCost.value * 12
  const housingMonthlyAnnual = input.monthlyHousingCost.value * 12
  const loanPayoffAge = input.loanRemainingYears.value > 0 ? currentAge + input.loanRemainingYears.value : null

  const rows: YearRow[] = []
  let assets = input.currentAssets.value
  let depletionAge: number | null = null
  let educationPeakAge: number | null = null
  let educationPeakAmount = 0

  for (let age = currentAge; age <= endAge; age++) {
    const yearsElapsed = age - currentAge

    // --- 年間労働収入（FIRE の差はここだけ） ---
    let laborIncome: number
    if (age < fireAge) {
      laborIncome = householdNet
    } else {
      laborIncome = workStyle === 'full_retire' ? 0 : postFireAnnual
    }

    // --- 年金 ---
    const pension = age >= input.pensionStartAge.value ? input.pensionAnnual.value : 0
    // --- 退職金（退職予定年齢の年に一度だけ計上） ---
    const lumpSum = age === input.retireAge.value ? input.retirementLumpSum.value : 0
    const income = laborIncome + pension + lumpSum

    // --- 教育費（子どもごとのプランから合算） ---
    const education = totalEducationCost(input.childPlans.value, yearsElapsed)
    if (education > educationPeakAmount) {
      educationPeakAmount = education
      educationPeakAge = age
    }

    // --- 住居費：持ち家ローンは完済年齢まで、賃貸・検討中は継続 ---
    let housing: number
    if (input.housingType.value === 'own') {
      housing = loanPayoffAge !== null && age < loanPayoffAge ? housingMonthlyAnnual : housingMonthlyAnnual * 0.2
      // 完済後は管理費・固定資産税相当を 2 割で残す
    } else {
      housing = housingMonthlyAnnual
    }

    const expense = livingAnnual + education + housing
    const net = income - expense

    // 翌年資産 = 前年資産 × (1+年利) + 年間収支
    assets = assets * (1 + annualReturn) + net

    if (assets < 0 && depletionAge === null) {
      depletionAge = age
    }

    rows.push({
      age,
      year: baseYear + yearsElapsed,
      income: round(income),
      expense: round(expense),
      education: round(education),
      housing: round(housing),
      assets: round(assets),
    })
  }

  const assetLongevity = depletionAge ?? endAge
  const residualAtEnd = rows[rows.length - 1]?.assets ?? 0
  const fireSuccess = depletionAge === null

  // FIRE達成度：fireAge〜endAge のうち資産がプラスで持つ年数の割合
  const fireAchievement = computeAchievement(fireAge, endAge, depletionAge)

  const lifeEvents = buildLifeEvents({
    input,
    baseYear,
    fireAge,
    loanPayoffAge,
    educationPeakAge,
    depletionAge,
  })

  return {
    rows,
    lifeEvents,
    fireAchievement,
    fireSuccess,
    depletionAge,
    assetLongevity,
    residualAtEnd: round(residualAtEnd),
    educationPeakAge,
    educationPeakAmount: round(educationPeakAmount),
    mortgagePayoffAge: loanPayoffAge,
  }
}

function computeAchievement(
  fireAge: number,
  endAge: number,
  depletionAge: number | null,
): number {
  if (depletionAge === null) return 100
  const target = Math.max(1, endAge - fireAge)
  const covered = Math.max(0, depletionAge - fireAge)
  return Math.round(Math.min(100, (covered / target) * 100))
}

function buildLifeEvents(args: {
  input: FullInput
  baseYear: number
  fireAge: number
  loanPayoffAge: number | null
  educationPeakAge: number | null
  depletionAge: number | null
}): LifeEvent[] {
  const { input, baseYear, fireAge, loanPayoffAge, educationPeakAge, depletionAge } = args
  const currentAge = input.currentAge.value
  const toYear = (age: number) => baseYear + (age - currentAge)
  const events: LifeEvent[] = []

  events.push({ age: currentAge, year: toYear(currentAge), type: 'now', label: '現在' })

  if (educationPeakAge !== null) {
    events.push({
      age: educationPeakAge,
      year: toYear(educationPeakAge),
      type: 'education_peak',
      label: '教育費ピーク',
      note: 'この時期は負担が大きくなりやすいです',
    })
  }

  if (fireAge > currentAge && fireAge <= input.endAge.value) {
    events.push({
      age: fireAge,
      year: toYear(fireAge),
      type: 'fire_start',
      label: input.workStyle.value === 'full_retire' ? 'FIRE開始' : '働き方の見直し',
    })
  }

  // 固定期間終了（固定金利の見直し時期）
  const fixedEndYears = input.fixedPeriodEndYears.value
  if (input.loanInterestType.value === 'fixed' && fixedEndYears > 0) {
    const fixedEndAge = currentAge + fixedEndYears
    if (fixedEndAge <= input.endAge.value) {
      events.push({
        age: fixedEndAge,
        year: toYear(fixedEndAge),
        type: 'fixed_period_end',
        label: '固定金利の終了',
        note: '金利が変わる可能性がある時期です',
      })
    }
  }

  if (loanPayoffAge !== null && loanPayoffAge <= input.endAge.value) {
    events.push({
      age: loanPayoffAge,
      year: toYear(loanPayoffAge),
      type: 'mortgage_payoff',
      label: '住宅ローン完済',
    })
  }

  events.push({
    age: input.pensionStartAge.value,
    year: toYear(input.pensionStartAge.value),
    type: 'pension_start',
    label: '年金開始',
  })

  if (depletionAge !== null) {
    events.push({
      age: depletionAge,
      year: toYear(depletionAge),
      type: 'depletion',
      label: '資産の見直しが必要な時期',
      note: '条件を調整すると改善できる可能性があります',
    })
  }

  events.push({
    age: input.endAge.value,
    year: toYear(input.endAge.value),
    type: 'end',
    label: `${input.endAge.value}歳時点`,
  })

  return events.sort((a, b) => a.age - b.age)
}

function round(n: number): number {
  return Math.round(n)
}
