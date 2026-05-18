/**
 * FIRE 人生設計シミュレーター
 * 将来的にReact化しやすいように、機能ごとにモジュール化
 */

// ============================================
// State Management
// ============================================
const State = {
  mode: null, // 'quick' | 'detailed'
  currentStep: 0,
  inputs: {},
  results: null,

  init() {
    this.load();
  },

  setMode(mode) {
    this.mode = mode;
    this.currentStep = 0;
    this.inputs = {};
    this.save();
  },

  setInput(key, value) {
    this.inputs[key] = value;
    this.save();
  },

  getInput(key) {
    return this.inputs[key];
  },

  setResults(results) {
    this.results = results;
    this.save();
  },

  getResults() {
    return this.results;
  },

  reset() {
    this.mode = null;
    this.currentStep = 0;
    this.inputs = {};
    this.results = null;
    this.save();
  },

  save() {
    localStorage.setItem('fireSimulatorState', JSON.stringify({
      mode: this.mode,
      currentStep: this.currentStep,
      inputs: this.inputs,
      results: this.results,
    }));
  },

  load() {
    const saved = localStorage.getItem('fireSimulatorState');
    if (saved) {
      const data = JSON.parse(saved);
      this.mode = data.mode;
      this.currentStep = data.currentStep;
      this.inputs = data.inputs || {};
      this.results = data.results;
    }
  },
};

// ============================================
// Form Steps Definition
// ============================================
const FormSteps = {
  quick: [
    {
      title: '基本情報',
      fields: [
        { id: 'age', label: '現在の年齢', type: 'number', min: 18, max: 100, unit: '歳', placeholder: '35' },
        { id: 'income', label: '世帯年収', type: 'number', min: 0, unit: '万円', placeholder: '500' },
        { id: 'assets', label: '現在の資産', type: 'number', min: 0, unit: '万円', placeholder: '300' },
      ],
    },
    {
      title: '家族',
      fields: [
        {
          id: 'childCount',
          label: 'お子さんの人数',
          type: 'select',
          options: { 0: 'いない', 1: '1人', 2: '2人', 3: '3人以上' },
        },
      ],
    },
    {
      title: 'FIRE目標',
      fields: [
        { id: 'fireAge', label: 'FIRE達成目標年齢', type: 'number', min: 25, max: 70, unit: '歳', placeholder: '45' },
        {
          id: 'fireType',
          label: 'FIREのタイプ',
          type: 'select',
          options: { full: '完全FIRE', side: 'サイドFIRE' },
        },
      ],
    },
  ],
  detailed: [
    {
      title: '基本情報',
      fields: [
        { id: 'age', label: '現在の年齢', type: 'number', min: 18, max: 100, unit: '歳', placeholder: '35' },
        { id: 'income', label: '世帯年収', type: 'number', min: 0, unit: '万円', placeholder: '500' },
        { id: 'assets', label: '現在の資産', type: 'number', min: 0, unit: '万円', placeholder: '300' },
      ],
    },
    {
      title: '家族構成',
      fields: [
        {
          id: 'childCount',
          label: 'お子さんの人数',
          type: 'select',
          options: { 0: 'いない', 1: '1人', 2: '2人', 3: '3人以上' },
        },
      ],
    },
    {
      title: '住宅・ローン',
      fields: [
        {
          id: 'housingType',
          label: '住まいのタイプ',
          type: 'select',
          options: { rent: '賃貸', own: '持ち家', owned: '住宅ローン返済中' },
        },
        { id: 'monthlyHousing', label: '月額住宅費', type: 'number', min: 0, unit: '万円', placeholder: '10' },
      ],
    },
    {
      title: '教育方針',
      fields: [
        {
          id: 'educationType',
          label: '教育方針',
          type: 'select',
          options: { public: '公立中心', mixed: '一部私立', private: '私立重視' },
        },
      ],
    },
    {
      title: 'FIRE設定',
      fields: [
        { id: 'fireAge', label: 'FIRE達成目標年齢', type: 'number', min: 25, max: 70, unit: '歳', placeholder: '45' },
        {
          id: 'fireType',
          label: 'FIREのタイプ',
          type: 'select',
          options: { full: '完全FIRE（労働なし）', side: 'サイドFIRE（月収あり）' },
        },
        { id: 'fireMonthlyIncome', label: 'FIRE後の月収（サイドFIREの場合）', type: 'number', min: 0, unit: '万円', placeholder: '10' },
      ],
    },
  ],
};

// ============================================
// Format Helpers
// ============================================
const Format = {
  // 万円を読みやすい文字列に（1万円未満四捨五入、1億円以上は「億」表記）
  money(man) {
    const v = Math.round(Number(man) || 0);
    if (Math.abs(v) >= 10000) {
      const oku = v / 10000;
      return oku.toFixed(oku % 1 === 0 ? 0 : 1) + '億円';
    }
    return v.toLocaleString('ja-JP') + '万円';
  },
};

// ============================================
// UI Control
// ============================================
const UI = {
  init() {
    this.setupEventListeners();
    if (!State.mode) {
      this.showScreen('intro-screen');
    }
  },

  setupEventListeners() {
    document.getElementById('intro-start-btn').addEventListener('click', () => {
      this.showScreen('mode-screen');
    });

    document.querySelectorAll('.mode-card').forEach((card) => {
      card.addEventListener('click', () => {
        const mode = card.dataset.mode;
        State.setMode(mode);
        this.renderInputScreen();
        this.showScreen('input-screen');
      });
    });

    document.getElementById('mode-back-btn').addEventListener('click', () => {
      this.showScreen('intro-screen');
    });

    document.getElementById('input-back-btn').addEventListener('click', () => {
      if (State.currentStep > 0) {
        State.currentStep--;
        this.renderInputScreen();
      } else {
        State.reset();
        this.showScreen('mode-screen');
      }
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
      if (State.currentStep > 0) {
        State.currentStep--;
        this.renderInputScreen();
      }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      if (this.validateCurrentStep()) {
        const totalSteps = FormSteps[State.mode].length;
        if (State.currentStep < totalSteps - 1) {
          State.currentStep++;
          this.renderInputScreen();
        } else {
          this.calculateAndShowResults();
        }
      }
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      State.reset();
      this.showScreen('intro-screen');
    });

    document.getElementById('download-btn').addEventListener('click', () => {
      this.downloadResults();
    });
  },

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.remove('screen--active');
    });
    document.getElementById(screenId).classList.add('screen--active');
    window.scrollTo(0, 0);
  },

  renderInputScreen() {
    const steps = FormSteps[State.mode];
    const currentStep = steps[State.currentStep];
    const totalSteps = steps.length;

    // Update header
    document.getElementById('step-title').textContent = currentStep.title;
    document.getElementById('current-step').textContent = State.currentStep + 1;
    document.getElementById('total-steps').textContent = totalSteps;

    // Update progress bar
    const progress = ((State.currentStep + 1) / totalSteps) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    // Render form fields
    const form = document.getElementById('input-form');
    form.innerHTML = '';

    currentStep.fields.forEach((field) => {
      const group = document.createElement('div');
      group.className = 'form-group';

      const label = document.createElement('label');
      label.className = 'form-label';
      label.textContent = field.label;

      let input;
      if (field.type === 'select') {
        input = document.createElement('select');
        input.className = 'form-select';
        Object.entries(field.options).forEach(([value, text]) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = text;
          if (State.getInput(field.id) === value) {
            option.selected = true;
          }
          input.appendChild(option);
        });
      } else {
        input = document.createElement('input');
        input.className = 'form-input';
        input.type = field.type;
        input.min = field.min || 0;
        if (field.max) input.max = field.max;
        input.placeholder = field.placeholder || '';
        input.value = State.getInput(field.id) || '';
      }

      input.id = 'form-' + field.id;
      input.addEventListener('change', (e) => {
        State.setInput(field.id, e.target.value);
      });
      input.addEventListener('input', (e) => {
        State.setInput(field.id, e.target.value);
      });

      if (field.unit && field.type !== 'select') {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.appendChild(input);
        const unitLabel = document.createElement('small');
        unitLabel.style.position = 'absolute';
        unitLabel.style.right = 'var(--spacing-md)';
        unitLabel.style.top = '50%';
        unitLabel.style.transform = 'translateY(-50%)';
        unitLabel.textContent = field.unit;
        unitLabel.style.pointerEvents = 'none';
        wrapper.appendChild(unitLabel);
        input.style.paddingRight = '3rem';
        group.appendChild(label);
        group.appendChild(wrapper);
        form.appendChild(group);
      } else {
        group.appendChild(label);
        group.appendChild(input);
        form.appendChild(group);
      }
    });

    // Update button states
    document.getElementById('prev-btn').style.display = State.currentStep === 0 ? 'none' : 'flex';
    const isLastStep = State.currentStep === totalSteps - 1;
    document.getElementById('next-btn').textContent = isLastStep ? '結果を見る →' : '次へ →';
  },

  validateCurrentStep() {
    const steps = FormSteps[State.mode];
    const currentStep = steps[State.currentStep];

    for (const field of currentStep.fields) {
      const el = document.getElementById('form-' + field.id);
      if (!el) continue;

      const value = el.value;

      // 表示されている値をStateへ確実に保存（selectの初期値も拾う）
      State.setInput(field.id, value);

      if (value === null || value === undefined || String(value).trim() === '') {
        alert(`${field.label}を入力してください`);
        el.focus();
        return false;
      }
    }
    return true;
  },

  calculateAndShowResults() {
    const results = Calculator.calculate(State.inputs);
    State.setResults(results);
    // 画面遷移を先に行い、描画失敗があっても結果画面は必ず表示する
    this.showScreen('result-screen');
    try {
      this.renderResultsScreen(results);
    } catch (e) {
      console.error('結果描画でエラー:', e);
    }
  },

  renderResultsScreen(results) {
    // FIRE gauge
    const percentage = Math.min(Math.round(results.fireAchievementRate * 100), 100);
    document.getElementById('fire-percentage').textContent = percentage + '%';

    // ゲージリングを実際の割合に合わせる
    const gaugeCircle = document.querySelector('.gauge-circle');
    if (gaugeCircle) {
      const deg = (percentage / 100) * 360;
      gaugeCircle.style.background =
        `conic-gradient(var(--color-primary) 0deg ${deg}deg, var(--color-light-gray) ${deg}deg 360deg)`;
    }

    const fireMessage = this.getFireMessage(results);
    document.getElementById('fire-message').textContent = fireMessage;

    const fireDetails = document.getElementById('fire-details');
    const achievementText = results.fireAchievementAge
      ? results.fireAchievementAge + '歳'
      : '目標年齢では未達';
    const lifespanText = results.depletionAge
      ? results.depletionAge + '歳で資産が尽きる試算'
      : '95歳まで維持できる試算';
    fireDetails.innerHTML = `
      <div class="fire-detail-item">
        <span class="fire-detail-label">FIRE到達年齢</span>
        <span class="fire-detail-value">${achievementText}</span>
      </div>
      <div class="fire-detail-item">
        <span class="fire-detail-label">95歳時点の資産</span>
        <span class="fire-detail-value">${Format.money(results.assetsAt95)}</span>
      </div>
      <div class="fire-detail-item">
        <span class="fire-detail-label">資産寿命</span>
        <span class="fire-detail-value">${lifespanText}</span>
      </div>
      <div class="fire-detail-item">
        <span class="fire-detail-label">ステータス</span>
        <span class="fire-detail-value">${results.status}</span>
      </div>
    `;

    // 各セクションは独立して描画（1つ失敗しても他は表示する）
    const sections = [
      () => this.renderAssetChart(results.assetTimeline),
      () => this.renderEducationSummary(results.educationCosts),
      () => this.renderTimeline(results.lifeEvents),
      () => this.renderCashflowTable(results.cashflow),
    ];
    sections.forEach((render) => {
      try {
        render();
      } catch (e) {
        console.error('セクション描画エラー:', e);
      }
    });
  },

  getFireMessage(results) {
    if (results.fireAchievementAge) {
      return `この前提なら ${results.fireAchievementAge}歳ごろ にFIREの目安に届きそうです`;
    } else if (results.fireAchievementRate >= 0.7) {
      return '目標まであと一歩。投資額や時期を少し調整すると届きそうです';
    } else {
      return '今の前提だと少し距離があります。条件を変えて試してみましょう';
    }
  },

  renderAssetChart(timeline) {
    const canvas = document.getElementById('asset-chart');
    if (!canvas) return;

    // Chart.js未読み込み時はフォールバック表示（結果画面は止めない）
    if (typeof Chart === 'undefined') {
      const container = canvas.parentElement;
      if (container) {
        container.innerHTML =
          '<p style="text-align:center;color:var(--color-medium-gray);">グラフを読み込めませんでした（通信環境をご確認ください）。下の表で資産推移をご覧いただけます。</p>';
      }
      return;
    }

    if (window.assetChart) {
      window.assetChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    window.assetChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeline.map((d) => d.age + '歳'),
        datasets: [
          {
            label: '資産額',
            data: timeline.map((d) => Math.round(d.assets)), // 万円単位
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => Format.money(item.parsed.y),
            },
          },
        },
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 8,
              autoSkip: true,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) =>
                value >= 10000 ? value / 10000 + '億' : value + '万',
            },
          },
        },
      },
    });
  },

  renderEducationSummary(educationCosts) {
    const container = document.getElementById('education-summary');
    if (!educationCosts || educationCosts.length === 0) {
      container.innerHTML = '<p>教育費の予定はありません</p>';
      return;
    }

    const html = educationCosts
      .map(
        (item) => `
      <div class="education-item">
        <div class="education-item__year">${item.childIndex}番目のお子さん ${item.stage}</div>
        <div class="education-item__amount">${item.cost}万円</div>
      </div>
    `
      )
      .join('');
    container.innerHTML = html;
  },

  renderTimeline(lifeEvents) {
    const container = document.getElementById('timeline');
    if (!lifeEvents || lifeEvents.length === 0) {
      container.innerHTML = '<p>イベント予定がありません</p>';
      return;
    }

    const html = lifeEvents
      .map(
        (event) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-label">${event.age}歳 / ${event.year}年</div>
          <div class="timeline-description">${event.label}</div>
        </div>
      </div>
    `
      )
      .join('');
    container.innerHTML = html;
  },

  renderCashflowTable(cashflow) {
    const container = document.getElementById('cashflow-table');
    if (!cashflow || cashflow.length === 0) {
      container.innerHTML = '<p>データがありません</p>';
      return;
    }

    const visibleRows = cashflow.slice(0, 10);
    const tableHTML = `
      <table class="cashflow-table">
        <thead>
          <tr>
            <th>年齢</th>
            <th>年収</th>
            <th>生活費</th>
            <th>資産額</th>
          </tr>
        </thead>
        <tbody>
          ${visibleRows
            .map(
              (row) => `
            <tr>
              <td>${row.age}歳</td>
              <td>${row.income.toLocaleString('ja-JP')}万</td>
              <td>${row.expenses.toLocaleString('ja-JP')}万</td>
              <td>${Format.money(row.assets)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      ${cashflow.length > 10 ? '<p style="color: var(--color-medium-gray); font-size: var(--font-size-sm); margin-top: var(--spacing-md);">以降のデータは省略しています</p>' : ''}
    `;
    container.innerHTML = tableHTML;
  },

  downloadResults() {
    const results = State.getResults();
    const text = `
FIRE 人生設計シミュレーター 結果報告書
=====================================

【基本情報】
現在の年齢: ${State.getInput('age')}歳
世帯年収: ${State.getInput('income')}万円
現在の資産: ${State.getInput('assets')}万円

【FIRE目標】
目標年齢: ${State.getInput('fireAge')}歳
タイプ: ${State.getInput('fireType') === 'full' ? '完全FIRE' : 'サイドFIRE'}

【結果】
FIRE達成度: ${Math.round(results.fireAchievementRate * 100)}%
FIRE到達年齢: ${results.fireAchievementAge ? results.fireAchievementAge + '歳' : '目標年齢では未達'}
95歳時点の資産: ${Format.money(results.assetsAt95)}
資産寿命: ${results.depletionAge ? results.depletionAge + '歳で資産が尽きる試算' : '95歳まで維持できる試算'}

このシミュレーターはざっくり現実的に見える化することを目的としており、
税制、社会保険、年金などは簡略化しています。
詳細なファイナンシャルプランニングについてはFPにご相談ください。
    `;

    const blob = new Blob([text], { type: 'text/plain; charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fire-simulator-result.txt';
    link.click();
  },
};

// ============================================
// Calculator
// ============================================
const Calculator = {
  // すべて「万円」単位で計算する（単位変換バグを避けるため）
  calculate(inputs) {
    const startAge = parseInt(inputs.age, 10) || 30;
    const income = parseInt(inputs.income, 10) || 500; // 世帯年収（万円/年）
    const startAssets = parseInt(inputs.assets, 10) || 0; // 現在資産（万円）
    const fireAge = parseInt(inputs.fireAge, 10) || 50;
    const fireType = inputs.fireType || 'full';
    const fireMonthlyIncome = parseInt(inputs.fireMonthlyIncome, 10) || 0; // 万円/月
    const childCount = parseInt(inputs.childCount, 10) || 0;
    const educationType = inputs.educationType || 'public';
    const monthlyHousing = parseInt(inputs.monthlyHousing, 10) || 10; // 万円/月

    // 前提（ざっくりMVP・控えめな数値）
    const returnRate = 0.04; // 年利4%（4%ルールと整合）
    const inflationRate = 0.015; // インフレ1.5%
    const incomeGrowth = 0.01; // 賃金上昇1%/年
    const taxRate = 0.18; // 税・社会保険ざっくり18%（労働収入のみ）
    const baseMonthlyLiving = 22; // 住居費を除く基本生活費（万円/月）
    const lifeEnd = 95;

    // 教育費を「発生年齢→金額(万円)」のマップに展開
    const educationByAge = this.buildEducationSchedule(startAge, childCount, educationType);

    const assetTimeline = [];
    const cashflow = [];
    let assets = startAssets;
    let fireAchievementAge = null;
    let depletionAge = null;
    let assetsAtFireAge = null;
    let livingAtFireAge = null;

    for (let age = startAge; age <= lifeEnd; age++) {
      const yr = age - startAge;

      // 労働収入（統一式：完全FIRE=0／サイドFIRE=月収×12）
      let laborIncome;
      if (age < fireAge) {
        laborIncome = income * Math.pow(1 + incomeGrowth, yr);
      } else if (fireType === 'side') {
        laborIncome = fireMonthlyIncome * 12;
      } else {
        laborIncome = 0;
      }

      const tax = laborIncome * taxRate;

      const inflationFactor = Math.pow(1 + inflationRate, yr);
      const baseLiving = (baseMonthlyLiving + monthlyHousing) * 12 * inflationFactor;
      const educationCost = educationByAge[age] || 0;
      const living = baseLiving + educationCost;

      // 統一式：翌年資産 = 前年資産×(1+年利) + 労働収入 − 生活費 − 税金
      const startOfYearAssets = assets;
      assets = startOfYearAssets * (1 + returnRate) + laborIncome - living - tax;

      if (assets < 0 && depletionAge === null) {
        depletionAge = age;
      }

      if (age === fireAge) {
        assetsAtFireAge = Math.max(0, startOfYearAssets);
        livingAtFireAge = baseLiving; // 教育費を除いた定常生活費で判定
      }

      // FIRE達成判定：目標年齢以降、資産が年間生活費の25倍（4%ルール）に到達
      if (age >= fireAge && fireAchievementAge === null && assets >= baseLiving * 25) {
        fireAchievementAge = age;
      }

      assetTimeline.push({ age, assets: Math.max(0, assets) });

      if (yr < 20) {
        cashflow.push({
          age,
          income: Math.round(laborIncome),
          expenses: Math.round(living),
          assets: Math.round(Math.max(0, assets)),
        });
      }
    }

    if (assetsAtFireAge === null) {
      // fireAgeがシミュレーション範囲外のときのフォールバック
      const last = assetTimeline[assetTimeline.length - 1];
      assetsAtFireAge = last ? last.assets : startAssets;
      livingAtFireAge = (baseMonthlyLiving + monthlyHousing) * 12;
    }

    const fireTarget = livingAtFireAge * 25;
    const fireAchievementRate = fireTarget > 0
      ? Math.max(0, Math.min(assetsAtFireAge / fireTarget, 1))
      : 0;

    const assetsAt95 = assetTimeline[lifeEnd - startAge]?.assets ?? 0;

    let status;
    if (fireAchievementAge !== null) {
      status = '達成可能';
    } else if (fireAchievementRate >= 0.7) {
      status = 'あと一歩';
    } else {
      status = '見直し余地あり';
    }

    return {
      fireAchievementAge,
      fireAchievementRate,
      assetsAtFireAge,
      assetsAt95,
      depletionAge,
      status,
      assetTimeline,
      educationCosts: this.calculateEducationCosts(childCount, educationType),
      lifeEvents: this.generateLifeEvents(startAge, fireAge, childCount, educationType),
      cashflow,
    };
  },

  // 教育費の発生スケジュール（子の現在年齢が不明なMVPでは0歳と仮定）
  buildEducationSchedule(startAge, childCount, educationType) {
    const schedule = {};
    if (!childCount || childCount <= 0) return schedule;

    const costsByType = {
      public: { middle: 130, high: 170, university: 260 },
      mixed: { middle: 180, high: 280, university: 400 },
      private: { middle: 260, high: 440, university: 620 },
    };
    const costs = costsByType[educationType] || costsByType.public;

    // 中学(12-14歳→3年) / 高校(15-17歳→3年) / 大学(18-21歳→4年)
    const stages = [
      { startOffset: 12, years: 3, total: costs.middle },
      { startOffset: 15, years: 3, total: costs.high },
      { startOffset: 18, years: 4, total: costs.university },
    ];

    for (let i = 0; i < childCount; i++) {
      // 子ごとに2歳ずつずらして重なりを緩和（ざっくり）
      const childOffset = i * 2;
      stages.forEach((stage) => {
        const perYear = stage.total / stage.years;
        for (let y = 0; y < stage.years; y++) {
          const age = startAge + stage.startOffset + childOffset + y;
          schedule[age] = (schedule[age] || 0) + perYear;
        }
      });
    }
    return schedule;
  },

  calculateEducationCosts(childCount, educationType) {
    if (childCount === 0 || childCount === '0') {
      return [];
    }

    const educationCostsByType = {
      public: { middle: 100, high: 150, university: 200 },
      mixed: { middle: 150, high: 250, university: 300 },
      private: { middle: 200, high: 400, university: 500 },
    };

    const costs = educationCostsByType[educationType];
    const result = [];

    for (let i = 1; i <= childCount; i++) {
      result.push(
        { childIndex: i, stage: '中学', cost: costs.middle },
        { childIndex: i, stage: '高校', cost: costs.high },
        { childIndex: i, stage: '大学', cost: costs.university }
      );
    }

    return result;
  },

  generateLifeEvents(startAge, fireAge, childCount, educationType) {
    const events = [];

    events.push({
      age: fireAge,
      year: new Date().getFullYear() + (fireAge - startAge),
      label: 'FIRE達成予定',
    });

    if (childCount > 0) {
      events.push({
        age: startAge + 5,
        year: new Date().getFullYear() + 5,
        label: 'お子さんの入学',
      });
    }

    // Add education events
    if (childCount > 0) {
      const educationStages = [
        { offset: 10, label: '中学入学' },
        { offset: 15, label: '高校入学' },
        { offset: 18, label: '大学入学' },
      ];

      educationStages.forEach((stage) => {
        events.push({
          age: startAge + stage.offset,
          year: new Date().getFullYear() + stage.offset,
          label: stage.label,
        });
      });
    }

    events.sort((a, b) => a.age - b.age);
    return events;
  },
};

// ============================================
// App Initialization
// ============================================
const App = {
  init() {
    State.init();
    UI.init();
  },
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
