import type { ChildEducation } from './education'
import type { Field } from './field'

// ------- ユーザー選択肢の型 -------

export type EducationPolicy = 'public' | 'some_private' | 'focused' | 'undecided'
export type HousingType = 'own' | 'rent' | 'considering'
export type WorkStyle = 'full_retire' | 'side_fire' | 'undecided'
export type InvestStyle = 'stable' | 'balanced' | 'growth'
export type LoanInterestType = 'fixed' | 'variable'

/** ざっくり診断の生の回答（5ページ9問） */
export interface QuickAnswers {
  age: number // 歳
  householdIncome: number // 世帯年収 万円
  currentAssets: number // 現在資産 万円
  childrenCount: number // 子ども人数
  educationPolicy: EducationPolicy
  housing: HousingType
  workStyle: WorkStyle
  reduceWorkAge: number // 仕事を減らしたい年齢
  investStyle: InvestStyle
}

/**
 * すべての診断が最終的に流し込む共通入力。
 * 各値は Field<T> で「出どころ」を保持する。
 */
export interface FullInput {
  currentAge: Field<number>
  endAge: Field<number>
  householdIncome: Field<number> // 万円/年（額面）
  currentAssets: Field<number> // 万円
  monthlyLivingCost: Field<number> // 万円/月
  childPlans: Field<ChildEducation[]> // 子どもごとの教育プラン
  housingType: Field<HousingType>
  monthlyHousingCost: Field<number> // 万円/月
  loanRemainingYears: Field<number> // 残年数（持ち家ローン）
  loanBalance: Field<number> // ローン残高 万円
  loanRatePct: Field<number> // 金利 %
  loanInterestType: Field<LoanInterestType> // 固定／変動
  fixedPeriodEndYears: Field<number> // 固定期間終了までの年数（0=なし）
  workStyle: Field<WorkStyle>
  fireAge: Field<number> // 仕事を減らす／FIRE開始年齢
  postFireMonthlyIncome: Field<number> // 万円/月（サイドFIRE後の労働収入）
  annualReturn: Field<number> // 想定利回り（小数 例: 0.04）
  pensionAnnual: Field<number> // 万円/年
  pensionStartAge: Field<number>
  retireAge: Field<number> // 退職予定年齢（退職金を受け取る年）
  retirementLumpSum: Field<number> // 退職金見込み 万円
}

/** しっかり診断の生の回答。すべて任意（未入力はおすすめ／標準値で補う） */
export interface DetailedAnswers {
  age?: number
  householdIncome?: number // 額面 万円/年
  currentAssets?: number // 万円
  monthlyLivingCost?: number // 万円/月
  childPlans?: ChildEducation[] // 子どもごとの教育プラン
  educationPolicy?: EducationPolicy // 一括設定の初期値に使う
  housing?: HousingType
  monthlyHousingCost?: number // 万円/月
  loanRemainingYears?: number
  loanBalance?: number // ローン残高 万円
  loanRatePct?: number // 金利 %
  loanInterestType?: LoanInterestType
  fixedPeriodEndYears?: number // 固定期間終了までの年数
  workStyle?: WorkStyle
  fireAge?: number
  postFireMonthlyIncome?: number // 万円/月
  annualReturnPct?: number // % 表記（例: 4）
  pensionAnnual?: number // 万円/年
  pensionStartAge?: number
  retireAge?: number
  retirementLumpSum?: number // 万円
}

// ------- シミュレーション結果 -------

export type LifeEventType =
  | 'now'
  | 'education_peak'
  | 'fire_start'
  | 'mortgage_payoff'
  | 'fixed_period_end'
  | 'pension_start'
  | 'end'
  | 'depletion'

export interface LifeEvent {
  age: number
  year: number
  type: LifeEventType
  label: string
  note?: string
}

export interface YearRow {
  age: number
  year: number
  income: number // 万円
  expense: number // 万円
  education: number // 万円
  housing: number // 万円
  assets: number // 年末資産 万円
}

export interface SimulationResult {
  rows: YearRow[]
  lifeEvents: LifeEvent[]
  /** FIRE達成度（0〜100）。fireAge以降95歳まで資産が持つ割合 */
  fireAchievement: number
  /** 95歳まで資産が持つか */
  fireSuccess: boolean
  /** 資産が尽きる年齢（持つ場合は null） */
  depletionAge: number | null
  /** 資産寿命（持続する場合は endAge） */
  assetLongevity: number
  /** 95歳（endAge）時点の残資産 万円 */
  residualAtEnd: number
  /** 教育費ピークの年齢と金額 */
  educationPeakAge: number | null
  educationPeakAmount: number
  /** 住宅ローン完済年齢（持ち家ローンがある場合） */
  mortgagePayoffAge: number | null
}
