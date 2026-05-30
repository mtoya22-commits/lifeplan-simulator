import type { QuickAnswers } from '../../domain/types'

export type QuickField = keyof QuickAnswers

interface BaseQuestion {
  key: QuickField
  label: string
  help?: string
}

export interface NumberQuestion extends BaseQuestion {
  kind: 'number'
  unit?: string
  min?: number
  max?: number
  step?: number
  recommended?: number
  placeholder?: string
}

export interface ChoiceQuestion extends BaseQuestion {
  kind: 'choice'
  options: { value: string; label: string; sub?: string }[]
}

export type Question = NumberQuestion | ChoiceQuestion

export interface QuickPage {
  title: string
  questions: Question[]
}

// 5ページ・9問（共有メモ #9）。スマホ1画面に収まる粒度。
export const QUICK_PAGES: QuickPage[] = [
  {
    title: 'あなたについて',
    questions: [
      { kind: 'number', key: 'age', label: '現在の年齢', unit: '歳', min: 18, max: 80, step: 1, placeholder: '40' },
      {
        kind: 'number',
        key: 'householdIncome',
        label: '世帯年収（額面）',
        unit: '万円',
        min: 0,
        max: 5000,
        step: 10,
        placeholder: '800',
        help: '夫婦合算の額面年収のおおよそで大丈夫です。',
      },
      {
        kind: 'number',
        key: 'currentAssets',
        label: '現在の金融資産',
        unit: '万円',
        min: 0,
        max: 100000,
        step: 10,
        placeholder: '1000',
        help: '預貯金・投資をあわせたおおよその合計です。',
      },
    ],
  },
  {
    title: 'お子さまと教育',
    questions: [
      { kind: 'number', key: 'childrenCount', label: '子どもの人数', unit: '人', min: 0, max: 5, step: 1, recommended: 0, placeholder: '2' },
      {
        kind: 'choice',
        key: 'educationPolicy',
        label: '教育方針',
        help: '迷ったら「未定」で構いません。あとから変えられます。',
        options: [
          { value: 'public', label: '公立中心', sub: 'なるべく公立で' },
          { value: 'some_private', label: '一部私立', sub: '高校から私立など' },
          { value: 'focused', label: '教育重視', sub: '私立・一人暮らしも視野' },
          { value: 'undecided', label: '未定', sub: 'まだ決めていない' },
        ],
      },
    ],
  },
  {
    title: '住まい',
    questions: [
      {
        kind: 'choice',
        key: 'housing',
        label: '住まいの状況',
        options: [
          { value: 'own', label: '持ち家', sub: 'ローン返済中を含む' },
          { value: 'rent', label: '賃貸' },
          { value: 'considering', label: '購入検討中' },
        ],
      },
    ],
  },
  {
    title: '将来の働き方',
    questions: [
      {
        kind: 'choice',
        key: 'workStyle',
        label: '将来どう働きたいですか',
        options: [
          { value: 'full_retire', label: '完全リタイアしたい' },
          { value: 'side_fire', label: '少し働きたい', sub: 'サイドFIRE' },
          { value: 'undecided', label: 'まだ決めていない' },
        ],
      },
      {
        kind: 'number',
        key: 'reduceWorkAge',
        label: '仕事を減らしたい年齢',
        unit: '歳',
        min: 35,
        max: 75,
        step: 1,
        recommended: 55,
        placeholder: '55',
        help: 'いまの仕事をセーブ／引退したい目安の年齢です。',
      },
    ],
  },
  {
    title: '投資スタイル',
    questions: [
      {
        kind: 'choice',
        key: 'investStyle',
        label: '資産運用の考え方',
        options: [
          { value: 'stable', label: '安定重視', sub: 'リスク控えめ' },
          { value: 'balanced', label: 'バランス型', sub: '標準的' },
          { value: 'growth', label: '成長重視', sub: 'リターン優先' },
        ],
      },
    ],
  },
]

export const DEFAULT_QUICK_ANSWERS: QuickAnswers = {
  age: 40,
  householdIncome: 800,
  currentAssets: 1000,
  childrenCount: 2,
  educationPolicy: 'undecided',
  housing: 'own',
  workStyle: 'side_fire',
  reduceWorkAge: 55,
  investStyle: 'balanced',
}
