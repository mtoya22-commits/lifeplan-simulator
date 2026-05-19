# 🔧 診断ガイド: モード選択ボタン不応答の解決

## 概要
モード選択画面で「ざっくり診断」「しっかりシミュレーション」ボタンがクリック不応答の問題を診断・解決します。

---

## ステップ1: ローカルテスト（5分）

### 目的
コード自体が正常か、Xserver 環境の問題か判定

### 手順

**オプションA: Python サーバーで実行**
```bash
cd /home/user/lifeplan-simulator
python3 -m http.server 8000
```

ブラウザで以下にアクセス：
```
http://localhost:8000/index.html
```

**オプションB: ファイルプロトコルで直接実行**
```
file:///home/user/lifeplan-simulator/index.html
```

### 確認項目
1. ✅ intro-screen の「シミュレーションを開始」ボタンをクリック
2. ✅ mode-screen が表示される（「ざっくり診断」「しっかりシミュレーション」ボタン見える）
3. ✅ 「ざっくり診断」ボタンをクリック → input-screen に移動するか？

### 結果判定

**A) ローカルで動作する場合** ✅
- **原因確定**: Xserver 環境の同期ズレ
- **対応**: 下記「ステップ2: Xserver 同期」に進む

**B) ローカルでも動作しない場合** ❌
- **原因確定**: コード自体に問題
- **対応**: 下記「ステップ3: デバッグログ確認」に進む

---

## ステップ2: Xserver 同期（10分）

**このステップは「ステップ1 でローカル動作した場合のみ」実行**

### 目的
Xserver 上のファイルを最新版に更新

### 手順

**Step 1: Xserver にログイン**
```bash
ssh ユーザー名@Xserver_IPアドレス
cd /path/to/fire-lifeplan-lab/wordpress
```

ディレクトリパスは以下の形式です：
- WordPress インストール先の `wp-content/plugins/lifeplan-simulator/` または
- テーマフォルダ内の `template-lifeplan-app.php` と同じ位置

**Step 2: Git ログ確認（最新コミットを確認）**
```bash
git log --oneline -5
```

**実行例:**
```
f3fbf0d (HEAD -> claude/wordpress-redesign-uiux-o9Jzd) Fix critical validation bug
e2f8c7a Add spouse feature implementation
9a3c8b2 Update design styles
```

`f3fbf0d` のようなハッシュが表示されればOK。

**Step 3: 最新コード取得**
```bash
git pull origin claude/wordpress-redesign-uiux-o9Jzd
```

**実行例:**
```
Already up to date.
```
または
```
Updating abc1234..def5678
Fast-forward
 script.js | 20 ++
 1 file changed, 20 insertions(+)
```

**Step 4: ファイルが更新されたか確認**
```bash
ls -la script.js
```

タイムスタンプが現在時刻に近いことを確認

**Step 5: Xserver 上の WordPress キャッシュ削除**
```bash
# キャッシュがあれば削除
rm -rf wp-content/cache/*
# または管理画面から キャッシュ削除（推奨）
```

### Step 6: ブラウザで確認

Xserver の実際の URL（例: `https://fire-lifeplan-lab.com/?page_id=6`）にアクセス

ブラウザで hard refresh 実行：
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

結果確認：
- ✅ 「ざっくり診断」ボタンをクリック → input-screen に移動するか？

---

## ステップ3: デバッグログ確認（15分）

**このステップは「ステップ1 でローカル非動作の場合のみ」実行**

### 目的
どこで処理が止まっているか特定

### 手順

**Step 1: script.js にデバッグコード追加**

`script.js` の L273 を以下のように修正：

**修正前：**
```javascript
card.addEventListener('click', () => {
  const mode = card.dataset.mode;
  State.setMode(mode);
  this.renderInputScreen();
  this.showScreen('input-screen');
});
```

**修正後：**
```javascript
card.addEventListener('click', () => {
  const mode = card.dataset.mode;
  console.log('[mode-card click] Triggered, mode:', mode);
  try {
    State.setMode(mode);
    console.log('[mode-card] State.setMode() success');
    this.renderInputScreen();
    console.log('[mode-card] renderInputScreen() success');
    this.showScreen('input-screen');
    console.log('[mode-card] showScreen() success');
  } catch(err) {
    console.error('[mode-card] ERROR:', err.message, err);
  }
});
```

**Step 2: ブラウザ開発者ツールで確認**

1. ブラウザで `http://localhost:8000/index.html` を開く
2. `F12` キーを押して開発者ツール表示
3. 「Console」タブに切り替え
4. mode-card ボタンをクリック
5. コンソール出力を確認：

**期待される出力:**
```
[mode-card click] Triggered, mode: quick
[mode-card] State.setMode() success
[mode-card] renderInputScreen() success
[mode-card] showScreen() success
```

**もし途中で止まっていたら:**
```
[mode-card click] Triggered, mode: quick
[mode-card] State.setMode() success
[mode-card] ERROR: Cannot read property 'length' of undefined
```

このような error メッセージが出れば、その内容をコピーして報告してください。

### Step 3: FormSteps確認

コンソール（F12 → Console）に以下を入力：
```javascript
console.log('FormSteps.quick:', FormSteps.quick !== undefined);
console.log('FormSteps.detailed:', FormSteps.detailed !== undefined);
```

**期待される出力:**
```
FormSteps.quick: true
FormSteps.detailed: true
```

---

## トラブルシューティング

### Q: ステップ1 でローカル動作、ステップ2 後も Xserver が動作しない
**A:** キャッシュが残っている可能性
- ブラウザキャッシュを完全削除してから hard refresh
- または別のブラウザ（Chrome, Safari など）で確認

### Q: git pull で "Permission denied" エラー
**A:** SSH キーの設定を確認
```bash
# SSH キーが設定されているか確認
ssh-add -l

# キーを追加
ssh-add ~/.ssh/id_rsa
```

### Q: コンソールに error が出ていない場合
**A:** 以下を確認
- Network tab で script.js が完全に読み込まれているか（サイズ確認）
- index.html で script タグが正しく設定されているか：
  ```html
  <script src="script.js" defer></script>
  ```

---

## 報告テンプレート

以下の情報を報告してください：

```
【ステップ1結果】
- ローカル動作: ✅ / ❌

【ステップ2結果（ローカル動作した場合）】
- Xserver 同期完了: ✅ / ❌
- Xserver 動作確認: ✅ / ❌

【ステップ3結果（ローカル非動作の場合）】
- コンソール出力:
  [ここにコンソール全体をコピペ]

【その他】
- ブラウザ: Chrome / Safari / Firefox
- OS: Windows / Mac / Linux
```

---

## 次のステップ

診断が完了したら、以下のいずれかの対応を行います：

**ケース1: Xserver 同期で解決した場合**
- ✅ 完了 → quick / detailed モード両方で全機能テスト

**ケース2: コード側の修正が必要な場合**
- デバッグログ出力に基づいて script.js を修正
- git commit & push
- Xserver に git pull を実行

---

## 参考資料

- `/home/user/lifeplan-simulator/script.js` L272-279: mode-card イベントリスナー設定箇所
- `/home/user/lifeplan-simulator/index.html` L71-81: mode-card ボタン HTML
- `/home/user/lifeplan-simulator/style.css` L328-358: mode-card スタイル
