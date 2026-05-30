# fire-lifeplan-lab — 人生設計シミュレーター

住宅ローン・教育費・投資・FIRE・老後を、**一つの人生の流れ**として可視化する人生設計シミュレーターです。
「未来を当てる」ためではなく、「未来を整理する」ためのツールを目指しています。

## 技術構成

- React 18 + TypeScript
- Vite
- Recharts（資産推移グラフ・遅延読み込み）
- WordPress 固定ページに iframe で埋め込み（`base: './'` で相対パスビルド）

## 開発

```bash
npm install
npm run dev -- --host 0.0.0.0   # スマホ実機は Network URL を開く
```

## ビルド

```bash
npm run build      # dist/ に出力。Xserver へ配置して iframe から参照
npm run preview
npm run typecheck
```

## ディレクトリ構成

```
src/
  domain/            計算ロジック（UIに依存しない）
    field.ts         Field<T>：値＋出どころ（source）管理
    types.ts         入力・結果の型定義
    education.ts     教育費ロジック（年齢区分×教育方針）
    buildInput.ts    診断回答 → 共通入力 FullInput への変換
    simulation.ts    年次シミュレーション本体・ライフイベント生成
  features/
    quick/           ざっくり診断（5ページ9問・ステップUI）
    result/          結果ダッシュボード・グラフ・タイムライン・Bottom Sheet
  hooks/
    useLocalStorage.ts  入力途中の自動保存／前回の続きから再開
```

## 設計の核

- **共通シミュレーション**：ざっくり診断もしっかり診断（今後）も、最終的に同じ年次シミュレーション
  (`runSimulation`) に流す。違いは入力値の出どころ（user_input / recommended / default / skipped）だけ。
- **FIRE ロジック**：完全FIREとサイドFIREで資産計算式を分けない。違いは「年間労働収入」だけ。
- **Field<T> の source 管理**：結果画面の「今回の試算条件」を自動生成し、ブラックボックス感をなくす。
- **人生タイムライン**：グラフとタイムラインは同じ `lifeEvents` を参照し、「何歳頃に何が起きるか」を見せる。

## 現状と今後

実装済み：ざっくり診断（9問）／共通シミュレーション／結果ダッシュボード／資産推移グラフ／
人生タイムライン／試算条件の自動生成／localStorage 自動保存。

今後：しっかり診断の本実装、教育費・住宅ローンの詳細ロジック、年金・退職金、シナリオ比較、
差分表示、PDF/CSV出力、自動デプロイ、記事導線。
