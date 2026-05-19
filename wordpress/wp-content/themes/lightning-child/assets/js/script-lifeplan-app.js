(function() {
'use strict';

/**
 * FIRE 人生設計シミュレーター
 * 将来的にReact化しやすいように、機能ごとにモジュール化
 * WordPress統合版（IIFE でスコープ隔離）
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
      title: 'あなたのこと',
      question: 'まず、いまのあなたについて教えてください',
      rationale: '将来の見通しは、いまの年齢・収入・資産から組み立てます。',
      fields: [
        { id: 'age', label: '現在の年齢', type: 'number', min: 18, max: 100, unit: '歳', placeholder: '35' },
        { id: 'income', label: '世帯年収', type: 'number', min: 0, unit: '万円', placeholder: '500' },
        { id: 'assets', label: '現在の資産', type: 'number', min: 0, unit: '万円', placeholder: '300' },
      ],
    },
    {
      title: '家族',
      question: 'お子さんはいらっしゃいますか',
      rationale: '教育費は人生の支出の山になります。人数だけ伺います。',
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
      title: 'これから',
      question: 'どんなふうに働き方を変えたいですか',
      rationale: '目標とする年齢とFIREのかたちで、必要な準備が変わります。',
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
      title: 'あなたのこと',
      question: 'まず、いまのあなたについて教えてください',
      rationale: '将来の見通しは、いまの年齢・収入・資産から組み立てます。',
      fields: [
        { id: 'age', label: '現在の年齢', type: 'number', min: 18, max: 100, unit: '歳', placeholder: '35' },
        { id: 'income', label: '世帯年収', type: 'number', min: 0, unit: '万円', placeholder: '500' },
        { id: 'assets', label: '現在の資産', type: 'number', min: 0, unit: '万円', placeholder: '300' },
      ],
    },
    {
      title: '家族',
      question: 'ご家族について教えてください',
      rationale: '教育費は時期と人数で変わります。まずは人数から伺います。',
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
      title: '住まい',
      question: 'いまの住まいについて教えてください',
      rationale: '住居費は家計の大きな固定費です。毎月の負担感を見ます。',
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
      title: '住宅ローン',
      question: '住宅ローンの条件を教えてください',
      rationale: '金利タイプと残り年数で、将来の支出の形が変わります。',
      fields: [
        {
          id: 'loanType',
          label: 'ローンタイプ',
          type: 'select',
          options: { fixed: '全期間固定', variable: '変動金利', hybrid: '固定期間終了後変動' },
        },
        { id: 'loanRate', label: '金利', type: 'number', min: 0, max: 10, step: 0.1, unit: '%', placeholder: '2.5' },
        { id: 'loanYears', label: '返済年数', type: 'number', min: 1, max: 50, unit: '年', placeholder: '35' },
      ],
    },
    {
      title: '資産形成',
      question: 'どのくらい投資にまわせそうですか',
      rationale: '毎月の積立と想定利回りが、将来の資産の伸びを決めます。',
      fields: [
        { id: 'monthlyInvestment', label: '毎月の投資額', type: 'number', min: 0, unit: '万円', placeholder: '5' },
        {
          id: 'returnRate',
          label: '想定年利',
          type: 'select',
          options: { '0.03': '3%（保守的）', '0.04': '4%（標準）', '0.05': '5%（積極的）', 'custom': 'カスタム' },
        },
        { id: 'returnRateCustom', label: 'カスタム年利', type: 'number', min: 0, max: 20, step: 0.1, unit: '%', placeholder: '4' },
      ],
    },
    {
      title: '教育の方針',
      question: 'お子さんの教育はどう考えていますか',
      rationale: '公立か私立かで、教育費の山の高さが大きく変わります。',
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
      title: 'お子さんごと',
      question: 'お子さんお一人ずつ教えてください',
      rationale: '年齢と進学先がわかると、教育費の時期をより正確に描けます。',
      fields: [
        {
          id: 'children',
          label: 'お子さんの情報を設定（年齢、進学予定）',
          type: 'custom',
          render: 'renderChildrenForm',
        },
      ],
    },
    {
      title: 'これから',
      question: 'どんなふうに働き方を変えたいですか',
      rationale: '目標年齢とFIREのかたちで、必要な準備が変わります。',
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
      const valid = this.validateCurrentStep();
      if (valid) {
        const totalSteps = FormSteps[State.mode].length;
        if (State.currentStep < totalSteps - 1) {
          State.currentStep++;
          this.renderInputScreen();
        } else {
          this.calculateAndShowResults();
        }
      } else {
        console.warn('Validation failed at step', State.currentStep + 1);
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

  resetScroll() {
    window.scrollTo(0, 0);
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
    const active = document.querySelector('.screen--active');
    if (active) {
      active.scrollTop = 0;
    }
    document.querySelectorAll('.input-scroll, .result-details, .result-hero').forEach((el) => {
      el.scrollTop = 0;
    });
  },

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.remove('screen--active');
    });
    document.getElementById(screenId).classList.add('screen--active');
    this.resetScroll();
  },

  renderInputScreen() {
    const steps = FormSteps[State.mode];
    const currentStep = steps[State.currentStep];
    const totalSteps = steps.length;

    const eyebrowEl = document.getElementById('step-eyebrow');
    const rationaleEl = document.getElementById('step-rationale');
    if (eyebrowEl) {
      eyebrowEl.textContent = currentStep.title;
    }
    document.getElementById('step-title').textContent = currentStep.question || currentStep.title;
    if (rationaleEl) {
      rationaleEl.textContent = currentStep.rationale || '';
    }
    document.getElementById('current-step').textContent = State.currentStep + 1;
    document.getElementById('total-steps').textContent = totalSteps;

    const progress = ((State.currentStep + 1) / totalSteps) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    const form = document.getElementById('input-form');
    form.innerHTML = '';

    currentStep.fields.forEach((field) => {
      if (field.type === 'custom') {
        if (field.render === 'renderChildrenForm') {
          UI.renderChildrenForm(form);
        }
        return;
      }

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
        input.addEventListener('change', (e) => {
          State.setInput(field.id, e.target.value);
          if (field.id === 'returnRate') {
            UI.updateReturnRateVisibility();
          }
        });
      } else {
        input = document.createElement('input');
        input.className = 'form-input';
        input.type = field.type;
        input.min = field.min || 0;
        if (field.max) input.max = field.max;
        if (field.step) input.step = field.step;
        input.placeholder = field.placeholder || '';
        input.value = State.getInput(field.id) || '';
        input.addEventListener('change', (e) => {
          State.setInput(field.id, e.target.value);
        });
        input.addEventListener('input', (e) => {
          State.setInput(field.id, e.target.value);
        });
      }

      input.id = 'form-' + field.id;

      if (field.id === 'returnRateCustom') {
        group.id = 'form-group-returnRateCustom';
      }

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

    document.getElementById('prev-btn').style.display = State.currentStep === 0 ? 'none' : 'flex';
    const isLastStep = State.currentStep === totalSteps - 1;
    document.getElementById('next-btn').textContent = isLastStep ? '結果を見る →' : '次へ →';

    this.updateReturnRateVisibility();

    requestAnimationFrame(() => this.resetScroll());
  },

  updateReturnRateVisibility() {
    const customGroup = document.getElementById('form-group-returnRateCustom');
    if (customGroup) {
      customGroup.style.display = State.getInput('returnRate') === 'custom' ? 'flex' : 'none';
    }
  },

  renderChildrenForm(form) {
    const childCount = parseInt(State.getInput('childCount'), 10) || 0;
    if (childCount === 0) {
      const p = document.createElement('p');
      p.style.color = 'var(--color-medium-gray)';
      p.textContent = 'お子さんがいないため、設定はありません';
      form.appendChild(p);
      return;
    }

    const childrenData = State.getInput('children') ? JSON.parse(State.getInput('children')) : [];

    for (let i = 0; i < childCount; i++) {
      const child = childrenData[i] || { age: '', schoolType: 'public' };

      const section = document.createElement('fieldset');
      section.style.border = '1px solid var(--color-border)';
      section.style.borderRadius = 'var(--radius-md)';
      section.style.padding = 'var(--spacing-md)';
      section.style.marginBottom = 'var(--spacing-md)';

      const legend = document.createElement('legend');
      legend.style.paddingLeft = 'var(--spacing-sm)';
      legend.style.fontWeight = 'var(--font-weight-semibold)';
      legend.textContent = `お子さん ${i + 1}`;
      section.appendChild(legend);

      const ageGroup = document.createElement('div');
      ageGroup.className = 'form-group';
      const ageLabel = document.createElement('label');
      ageLabel.className = 'form-label';
      ageLabel.textContent = '現在の年齢';
      const ageInput = document.createElement('input');
      ageInput.className = 'form-input';
      ageInput.type = 'number';
      ageInput.min = 0;
      ageInput.max = 30;
      ageInput.placeholder = '10';
      ageInput.value = child.age;
      ageInput.addEventListener('input', (e) => {
        childrenData[i] = childrenData[i] || {};
        childrenData[i].age = e.target.value;
        State.setInput('children', JSON.stringify(childrenData));
      });
      ageGroup.appendChild(ageLabel);
      ageGroup.appendChild(ageInput);
      section.appendChild(ageGroup);

      const schoolGroup = document.createElement('div');
      schoolGroup.className = 'form-group';
      const schoolLabel = document.createElement('label');
      schoolLabel.className = 'form-label';
      schoolLabel.textContent = '進学予定';
      const schoolSelect = document.createElement('select');
      schoolSelect.className = 'form-select';
      const schoolOptions = [
        { value: 'public', text: '公立' },
        { value: 'private', text: '私立' },
        { value: 'mixed', text: '一部私立' },
      ];
      schoolOptions.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        if (child.schoolType === opt.value) option.selected = true;
        schoolSelect.appendChild(option);
      });
      schoolSelect.addEventListener('change', (e) => {
        childrenData[i] = childrenData[i] || {};
        childrenData[i].schoolType = e.target.value;
        State.setInput('children', JSON.stringify(childrenData));
      });
      schoolGroup.appendChild(schoolLabel);
      schoolGroup.appendChild(schoolSelect);
      section.appendChild(schoolGroup);

      form.appendChild(section);
    }
  },

  validateCurrentStep() {
    const steps = FormSteps[State.mode];
    const currentStep = steps[State.currentStep];

    for (const field of currentStep.fields) {
      if (field.type === 'custom') {
        if (field.id === 'children') {
          const childCount = parseInt(State.getInput('childCount'), 10) || 0;
          if (childCount > 0) {
            const childrenData = State.getInput('children') ? JSON.parse(State.getInput('children')) : [];
            for (let i = 0; i < childCount; i++) {
              const child = childrenData[i];
              if (!child || !child.age || String(child.age).trim() === '') {
                alert(`お子さん ${i + 1} の年齢を入力してください`);
                return false;
              }
            }
          }
        }
        continue;
      }

      const el = document.getElementById('form-' + field.id);
      if (!el) {
        console.warn(`Skipping field ${field.id} - element not found`);
        continue;
      }

      const value = el.value;
      State.setInput(field.id, value);

      if (field.id === 'returnRate') {
        if (value === 'custom') {
          const customEl = document.getElementById('form-returnRateCustom');
          if (customEl) {
            const customValue = customEl.value;
            if (!customValue || String(customValue).trim() === '') {
              alert('カスタム年利を入力してください');
              customEl.focus();
              return false;
            }
            State.setInput('returnRateCustom', customValue);
          } else {
            alert('カスタム年利フィールドが見つかりません');
            return false;
          }
        }
      }

      if (field.id === 'returnRateCustom') {
        continue;
      }

      if (field.id === 'fireMonthlyIncome') {
        if (State.getInput('fireType') === 'full') {
          continue;
        }
        if (value === null || value === undefined || String(value).trim() === '') {
          alert(`${field.label}を入力してください`);
          el.focus();
          return false;
        }
        continue;
      }

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
    this.showScreen('result-screen');
    try {
      this.renderResultsScreen(results);
    } catch (e) {
      console.error('結果描画でエラー:', e);
    }
  },

  renderResultsScreen(results) {
    const percentage = Math.min(Math.round(results.fireAchievementRate * 100), 100);

    const arc = document.getElementById('gauge-arc');
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (arc) {
      const r = arc.r.baseVal.value;
      const circumference = 2 * Math.PI * r;
      arc.style.strokeDasharray = String(circumference);
      arc.style.strokeDashoffset = String(circumference);
      const targetOffset = circumference * (1 - percentage / 100);
      if (reduceMotion) {
        arc.style.transition = 'none';
        arc.style.strokeDashoffset = String(targetOffset);
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            arc.style.strokeDashoffset = String(targetOffset);
          });
        });
      }
    }

    const pctEl = document.getElementById('fire-percentage');
    if (pctEl) {
      if (reduceMotion || percentage === 0) {
        pctEl.textContent = percentage + '%';
      } else {
        const duration = 900;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          pctEl.textContent = Math.round(eased * percentage) + '%';
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
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
            data: timeline.map((d) => Math.round(d.assets)),
            borderColor: '#c9a876',
            backgroundColor: 'rgba(201, 168, 118, 0.12)',
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
  calculate(inputs) {
    const startAge = parseInt(inputs.age, 10) || 30;
    const income = parseInt(inputs.income, 10) || 500;
    const startAssets = parseInt(inputs.assets, 10) || 0;
    const fireAge = parseInt(inputs.fireAge, 10) || 50;
    const fireType = inputs.fireType || 'full';
    const fireMonthlyIncome = parseInt(inputs.fireMonthlyIncome, 10) || 0;
    const childCount = parseInt(inputs.childCount, 10) || 0;
    const educationType = inputs.educationType || 'public';
    const monthlyHousing = parseInt(inputs.monthlyHousing, 10) || 10;
    const monthlyInvestment = parseInt(inputs.monthlyInvestment, 10) || 0;
    const loanType = inputs.loanType || 'fixed';
    const loanRate = parseFloat(inputs.loanRate) || 2.5;
    const loanYears = parseInt(inputs.loanYears, 10) || 35;

    let returnRate = 0.04;
    if (inputs.returnRate && inputs.returnRate !== 'custom') {
      returnRate = parseFloat(inputs.returnRate);
    } else if (inputs.returnRate === 'custom' && inputs.returnRateCustom) {
      returnRate = parseFloat(inputs.returnRateCustom) / 100;
    }

    let childrenData = [];
    if (inputs.children) {
      try {
        childrenData = JSON.parse(inputs.children);
      } catch (e) {
        childrenData = [];
      }
    }

    const inflationRate = 0.015;
    const incomeGrowth = 0.01;
    const taxRate = 0.18;
    const baseMonthlyLiving = 22;
    const lifeEnd = 95;

    const educationByAge = this.buildDetailedEducationSchedule(startAge, childrenData, educationType);

    const assetTimeline = [];
    const cashflow = [];
    let assets = startAssets;
    let fireAchievementAge = null;
    let depletionAge = null;
    let assetsAtFireAge = null;
    let livingAtFireAge = null;

    for (let age = startAge; age <= lifeEnd; age++) {
      const yr = age - startAge;

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

      const annualInvestment = age < fireAge ? monthlyInvestment * 12 : 0;

      const startOfYearAssets = assets;
      assets = startOfYearAssets * (1 + returnRate) + laborIncome + annualInvestment - living - tax;

      if (assets < 0 && depletionAge === null) {
        depletionAge = age;
      }

      if (age === fireAge) {
        assetsAtFireAge = Math.max(0, startOfYearAssets);
        livingAtFireAge = baseLiving;
      }

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

  buildDetailedEducationSchedule(startAge, childrenData, fallbackEducationType) {
    const schedule = {};
    if (!childrenData || childrenData.length === 0) return schedule;

    const costsByType = {
      public: { middle: 130, high: 170, university: 260 },
      mixed: { middle: 180, high: 280, university: 400 },
      private: { middle: 260, high: 440, university: 620 },
    };

    childrenData.forEach((child, childIdx) => {
      const childAge = parseInt(child.age, 10) || 0;
      const schoolType = child.schoolType || fallbackEducationType || 'public';
      const costs = costsByType[schoolType] || costsByType.public;

      const stages = [
        { ageStart: 12, years: 3, total: costs.middle },
        { ageStart: 15, years: 3, total: costs.high },
        { ageStart: 18, years: 4, total: costs.university },
      ];

      stages.forEach((stage) => {
        const perYear = stage.total / stage.years;
        for (let y = 0; y < stage.years; y++) {
          const targetAge = childAge + (stage.ageStart - childAge) + y;
          const personAge = startAge + (targetAge - childAge);
          if (personAge >= startAge && personAge <= 95) {
            schedule[personAge] = (schedule[personAge] || 0) + perYear;
          }
        }
      });
    });

    return schedule;
  },

  buildEducationSchedule(startAge, childCount, educationType) {
    const schedule = {};
    if (!childCount || childCount <= 0) return schedule;

    const costsByType = {
      public: { middle: 130, high: 170, university: 260 },
      mixed: { middle: 180, high: 280, university: 400 },
      private: { middle: 260, high: 440, university: 620 },
    };
    const costs = costsByType[educationType] || costsByType.public;

    const stages = [
      { startOffset: 12, years: 3, total: costs.middle },
      { startOffset: 15, years: 3, total: costs.high },
      { startOffset: 18, years: 4, total: costs.university },
    ];

    for (let i = 0; i < childCount; i++) {
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

})();
