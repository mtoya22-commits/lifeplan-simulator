// 入力値は「値」だけでなく「出どころ」を持つ。
// 結果画面で「今回の試算条件」を自動生成し、ブラックボックス感をなくすため。

export type FieldSource =
  | 'user_input' // ユーザーが直接入力した
  | 'recommended_value' // おすすめ値を採用した
  | 'default_value' // 標準値で補った
  | 'skipped' // スキップされ標準値で補った

export interface Field<T> {
  value: T
  source: FieldSource
  label: string
  /** 結果画面の「今回の試算条件」に表示する説明 */
  assumptionText?: string
}

export function field<T>(
  value: T,
  source: FieldSource,
  label: string,
  assumptionText?: string,
): Field<T> {
  return { value, source, label, assumptionText }
}

export const SOURCE_LABEL: Record<FieldSource, string> = {
  user_input: '入力値',
  recommended_value: 'おすすめ値',
  default_value: '標準値',
  skipped: '未入力（標準値）',
}
