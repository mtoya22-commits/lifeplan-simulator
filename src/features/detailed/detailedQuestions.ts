import type { DetailedAnswers } from '../../domain/types'

type Key = keyof DetailedAnswers

interface Base {
  key: Key
  label: string
  help?: string
}
export interface DNumber extends Base {
  kind: 'number'
  unit?: string
  min?: number
  max?: number
  step?: number
  recommended?: number
  placeholder?: string
}
export interface DChoice extends Base {
  kind: 'choice'
  options: { value: string; label: string; sub?: string }[]
}
export interface DChildren extends Base {
  kind: 'children'
}
export type DField = DNumber | DChoice | DChildren

export interface DSection {
  title: string
  caption?: string
  fields: DField[]
}

// しっかり診断：項目は多くてよいが全部必須にしない（共有メモ #10）。
// 分からないものはスキップ可能。入力した分だけ精度が上がる。
export const DETAILED_SECTIONS: DSection[] = [
  {
    title: '基本',
    caption: 'まずは土台となる数字から。分かる範囲で大丈夫です。',
    fields: [
      { kind: 'number', key: 'age', label: '現在の年齢', unit: '歳', min: 18, max: 80, step: 1, placeholder: '40' },
      { kind: 'number', key: 'householdIncome', label: '世帯年収（額面）', unit: '万円', min: 0, max: 5000, step: 10, placeholder: '800' },
      { kind: 'number', key: 'currentAssets', label: '現在の金融資産', unit: '万円', min: 0, max: 100000, step: 10, placeholder: '1000' },
    ],
  },
  {
    title: '支出',
    fields: [
      {
        kind: 'number',
        key: 'monthlyLivingCost',
        label: '毎月の生活費',
        unit: '万円',
        min: 0,
        max: 200,
        step: 1,
        placeholder: '26',
        help: '家賃・住宅ローンを除いた、毎月のおおよその支出です。',
      },
    ],
  },
  {
    title: '教育',
    caption: 'まず教育方針を選ぶと、お子さまごとの初期値に反映されます。年齢と進路は個別に調整できます。',
    fields: [
      {
        kind: 'choice',
        key: 'educationPolicy',
        label: '教育方針（初期値）',
        options: [
          { value: 'public', label: '公立中心' },
          { value: 'some_private', label: '一部私立' },
          { value: 'focused', label: '教育重視' },
          { value: 'undecided', label: '未定' },
        ],
      },
      { kind: 'children', key: 'childPlans', label: 'お子さまごとの設定' },
    ],
  },
  {
    title: '住宅',
    fields: [
      {
        kind: 'choice',
        key: 'housing',
        label: '住まいの状況',
        options: [
          { value: 'own', label: '持ち家' },
          { value: 'rent', label: '賃貸' },
          { value: 'considering', label: '購入検討中' },
        ],
      },
      { kind: 'number', key: 'monthlyHousingCost', label: '毎月の住居費', unit: '万円', min: 0, max: 100, step: 1, placeholder: '10', help: 'ローン返済額または家賃の毎月の額です。年間住居費はこの12倍で計算します。' },
      { kind: 'number', key: 'loanRemainingYears', label: 'ローン残年数', unit: '年', min: 0, max: 50, step: 1, placeholder: '20', help: '持ち家でローン返済中の場合の、残りの返済年数です。完済年齢がタイムラインに表示されます。' },
      { kind: 'number', key: 'loanBalance', label: 'ローン残高', unit: '万円', min: 0, max: 20000, step: 50, placeholder: '2500', help: '現在のおおよその残高です。残高推移の表示に使います。' },
      { kind: 'number', key: 'loanRatePct', label: '住宅ローン金利', unit: '%', min: 0, max: 5, step: 0.05, recommended: 1.0, placeholder: '1.0' },
      {
        kind: 'choice',
        key: 'loanInterestType',
        label: '金利タイプ',
        options: [
          { value: 'variable', label: '変動金利' },
          { value: 'fixed', label: '固定金利' },
        ],
      },
      { kind: 'number', key: 'fixedPeriodEndYears', label: '固定期間の終了', unit: '年後', min: 0, max: 35, step: 1, placeholder: '7', help: '固定金利の場合、あと何年で固定期間が終わるか。終了時期をタイムラインに表示します。' },
    ],
  },
  {
    title: '働き方・FIRE',
    fields: [
      {
        kind: 'choice',
        key: 'workStyle',
        label: '将来の働き方',
        options: [
          { value: 'full_retire', label: '完全リタイア' },
          { value: 'side_fire', label: '少し働く（サイドFIRE）' },
          { value: 'undecided', label: '未定' },
        ],
      },
      { kind: 'number', key: 'fireAge', label: '仕事を減らす年齢', unit: '歳', min: 35, max: 75, step: 1, recommended: 55, placeholder: '55' },
      { kind: 'number', key: 'postFireMonthlyIncome', label: 'FIRE後の毎月収入', unit: '万円', min: 0, max: 100, step: 1, placeholder: '12', help: '完全リタイアなら0、少し働くなら見込み額を入れてください。' },
    ],
  },
  {
    title: '投資',
    fields: [
      { kind: 'number', key: 'annualReturnPct', label: '想定利回り（年）', unit: '%', min: 0, max: 12, step: 0.5, recommended: 4, placeholder: '4', help: '迷ったら4%程度が一つの目安です。' },
    ],
  },
  {
    title: '老後',
    caption: 'ねんきん定期便や退職金規程が手元にあれば、より正確になります。',
    fields: [
      { kind: 'number', key: 'pensionAnnual', label: '年金見込み（年）', unit: '万円', min: 0, max: 500, step: 10, recommended: 180, placeholder: '180', help: 'ねんきん定期便の見込み額（年額）が目安です。' },
      { kind: 'number', key: 'pensionStartAge', label: '年金開始年齢', unit: '歳', min: 60, max: 75, step: 1, recommended: 65, placeholder: '65' },
      { kind: 'number', key: 'retireAge', label: '退職予定年齢', unit: '歳', min: 40, max: 75, step: 1, placeholder: '60' },
      { kind: 'number', key: 'retirementLumpSum', label: '退職金見込み', unit: '万円', min: 0, max: 10000, step: 50, placeholder: '1000' },
      { kind: 'number', key: 'oldAgeMonthlyLivingCost', label: '老後の毎月生活費', unit: '万円', min: 0, max: 100, step: 1, placeholder: '22', help: '年金開始以降の毎月の生活費です。現役期より少し下がる家庭が多めです。' },
      { kind: 'number', key: 'medicalCareReserve', label: '医療・介護予備費', unit: '万円', min: 0, max: 5000, step: 50, placeholder: '500', help: '後半の医療・介護にそなえる予備費。80歳時点の一時支出として試算します。' },
    ],
  },
]
