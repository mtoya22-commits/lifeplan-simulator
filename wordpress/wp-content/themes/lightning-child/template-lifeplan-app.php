<?php
/**
 * Template Name: Life Plan Simulator App
 * Template Post Type: page
 */
get_header();
do_action( 'lightning_before_main' );
?>
<div id="app" class="app">

  <div id="intro-screen" class="screen screen--active">
    <div class="intro-container">
      <div class="intro-content">
        <p class="intro-eyebrow">LIFE PLAN</p>
        <h1 class="intro-title">FIRE 人生設計シミュレーター</h1>
        <p class="intro-subtitle">住宅ローン・教育費・FIRE・老後を、一つの流れとして静かに見渡せます</p>
        <div class="intro-features">
          <div class="feature-item">
            <span class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M13 16V8"/><path d="M18 16v-3"/></svg>
            </span>
            <p>人生のお金を整理</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 4v3"/><path d="M12 17v3"/><path d="M4 12h3"/><path d="M17 12h3"/></svg>
            </span>
            <p>FIRE達成を可視化</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.5"/><path d="M4 19v-1a5 5 0 0 1 10 0v1"/><path d="M15 19v-1a4 4 0 0 1 5-3.8"/></svg>
            </span>
            <p>家族の未来を設計</p>
          </div>
        </div>
      </div>
      <button id="intro-start-btn" class="btn btn--primary btn--large">シミュレーションを開始</button>
      <p class="intro-note">入力内容は端末内に保存され、サーバーへは送信されません</p>
    </div>
  </div>

  <div id="mode-screen" class="screen">
    <div class="screen-header">
      <button class="btn-back" id="mode-back-btn" aria-label="戻る">← 戻る</button>
      <h1 class="screen-title">シミュレーション方法を選択</h1>
    </div>
    <div class="mode-options">
      <button class="mode-card" data-mode="quick">
        <h2 class="mode-card__title">ざっくり診断</h2>
        <p class="mode-card__description">3～5問、約30秒</p>
        <p class="mode-card__detail">とにかく早く将来像をチェック</p>
      </button>
      <button class="mode-card" data-mode="detailed">
        <h2 class="mode-card__title">しっかりシミュレーション</h2>
        <p class="mode-card__description">15～20問</p>
        <p class="mode-card__detail">詳細設定で現実的に設計</p>
      </button>
    </div>
  </div>

  <div id="input-screen" class="screen">
    <div class="input-scroll" id="input-scroll">
      <div class="screen-header">
        <button class="btn-back" id="input-back-btn" aria-label="戻る">← 戻る</button>
        <p class="step-eyebrow" id="step-eyebrow">STEP</p>
        <h1 class="screen-title" id="step-title">まず、いまのあなたについて教えてください</h1>
        <p class="step-rationale" id="step-rationale"></p>
      </div>
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
        <p class="progress-label"><span id="current-step">1</span> / <span id="total-steps">5</span></p>
      </div>
      <form id="input-form" class="form"></form>
    </div>
    <div class="form-actions form-actions--footer">
      <button type="button" id="prev-btn" class="btn btn--secondary">← 戻る</button>
      <button type="button" id="next-btn" class="btn btn--primary">次へ →</button>
    </div>
  </div>

  <div id="result-screen" class="screen">
    <div class="result-hero">
      <div class="screen-header">
        <p class="step-eyebrow">YOUR PLAN</p>
        <h1 class="screen-title">あなたの人生設計</h1>
      </div>
      <div class="result-card result-card--hero">
        <div class="card-content">
          <h2 class="card-title">FIRE達成度</h2>
          <div class="fire-gauge">
            <div class="gauge-circle">
              <svg class="gauge-ring" viewBox="0 0 120 120" aria-hidden="true">
                <circle class="gauge-track" cx="60" cy="60" r="54" fill="none" />
                <circle id="gauge-arc" cx="60" cy="60" r="54" fill="none" transform="rotate(-90 60 60)" stroke-linecap="round" />
              </svg>
              <span class="gauge-value" id="fire-percentage">0%</span>
            </div>
          </div>
          <p class="fire-message" id="fire-message">シミュレーション中...</p>
          <div class="fire-details" id="fire-details"></div>
        </div>
      </div>
    </div>
    <div class="result-details">
      <div class="result-card">
        <h2 class="card-title">これからの歩み</h2>
        <div id="timeline" class="timeline"></div>
      </div>
      <div class="result-card">
        <h2 class="card-title">資産の移り変わり</h2>
        <div class="chart-container">
          <canvas id="asset-chart" height="250"></canvas>
        </div>
      </div>
      <div class="result-card">
        <h2 class="card-title">教育費の山</h2>
        <div id="education-summary" class="education-summary"></div>
      </div>
      <details class="result-card result-card--details">
        <summary class="details-summary">年度ごとの内訳を詳しく見る</summary>
        <div id="cashflow-table" class="cashflow-table-wrapper"></div>
      </details>
      <div class="result-actions">
        <button id="download-btn" class="btn btn--secondary">結果を保存</button>
        <button id="restart-btn" class="btn btn--primary">もう一度試す</button>
      </div>
    </div>
  </div>

</div>

<div id="result-modal" class="result-modal" aria-hidden="true">
  <div class="result-modal__backdrop"></div>
  <div class="result-modal__content" role="dialog" aria-labelledby="modal-title">
    <div class="result-modal__header">
      <h2 id="modal-title" class="result-modal__title"></h2>
      <button class="result-modal__close" aria-label="閉じる">✕</button>
    </div>
    <div class="result-modal__body"></div>
  </div>
</div>
<?php
do_action( 'lightning_after_main' );
get_footer();
?>
