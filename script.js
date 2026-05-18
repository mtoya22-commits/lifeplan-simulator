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
        if (field.unit) {
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
          return;
        }
      }

      input.id = 'form-' + field.id;
      input.addEventListener('change', (e) => {
        State.setInput(field.id, e.target.value);
      });
      input.addEventListener('input', (e) => {
        State.setInput(field.id, e.target.value);
      });

      group.appendChild(label);
      group.appendChild(input);
      form.appendChild(group);
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
      const value = State.getInput(field.id);
      if (!value && value !== 0) {
        alert(`${field.label}を入力してください`);
        return false;
      }
    }
    return true;
  },

  calculateAndShowResults() {
    const results = Calculator.calculate(State.inputs);
    State.setResults(results);
    this.renderResultsScreen(results);
    this.showScreen('result-screen');
  },

  renderResultsScreen(results) {
    // FIRE gauge
    const percentage = Math.min(Math.round(results.fireAchievementRate * 100), 100);
    document.getElementById('fire-percentage').textContent = percentage + '%';

    const fireMessage = this.getFireMessage(results);
    document.getElementById('fire-message').textContent = fireMessage;

    const fireDetails = document.getElementById('fire-details');
    fireDetails.innerHTML = `
      <div class="fire-detail-item">
        <span class="fire-detail-label">目標達成年齢</span>
        <span class="fire-detail-value">${results.fireAchievementAge || '達成困難'}歳</span>
      </div>
      <div class="fire-detail-item">
        <span class="fire-detail-label">95歳時点の資産</span>
        <span class="fire-detail-value">${(results.assetsAt95 / 1000).toFixed(1)}千万円</span>
      </div>
      <div class="fire-detail-item">
        <span class="fire-detail-label">資産寿命</span>
        <span class="fire-detail-value">${results.assetLifespan || '∞'}年</span>
      </div>
      <div class="fire-detail-item">
        <span class="fire-detail-label">ステータス</span>
        <span class="fire-detail-value">${results.status}</span>
      </div>
    `;

    // Chart
    this.renderAssetChart(results.assetTimeline);

    // Education summary
    this.renderEducationSummary(results.educationCosts);

    // Timeline
    this.renderTimeline(results.lifeEvents);

    // Cashflow table
    this.renderCashflowTable(results.cashflow);
  },

  getFireMessage(results) {
    if (results.fireAchievementAge) {
      return `${results.fireAchievementAge}歳でFIRE達成を目指せます`;
    } else if (results.fireAchievementRate > 0.8) {
      return '現在のペースではFIRE達成は難しいですが、改善の余地があります';
    } else {
      return '投資額や貯蓄率の見直しが必要です';
    }
  },

  renderAssetChart(timeline) {
    const canvas = document.getElementById('asset-chart');
    if (!canvas) return;

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
            data: timeline.map((d) => d.assets / 10000), // 万円単位
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
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return (value / 100).toFixed(0) + '万';
              },
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
              <td>${row.income}万</td>
              <td>${row.expenses}万</td>
              <td>${(row.assets / 10000).toFixed(1)}万</td>
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
予想達成年齢: ${results.fireAchievementAge || '達成困難'}歳
95歳時点の資産: ${(results.assetsAt95 / 1000).toFixed(1)}千万円
資産寿命: ${results.assetLifespan || '∞'}年

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
    const startAge = parseInt(inputs.age) || 30;
    const startIncome = parseInt(inputs.income) || 500;
    const startAssets = parseInt(inputs.assets) || 0;
    const fireAge = parseInt(inputs.fireAge) || 50;
    const fireType = inputs.fireType || 'full';
    const fireMonthlyIncome = parseInt(inputs.fireMonthlyIncome) || 0;
    const childCount = parseInt(inputs.childCount) || 0;
    const educationType = inputs.educationType || 'public';
    const housingType = inputs.housingType || 'rent';
    const monthlyHousing = parseInt(inputs.monthlyHousing) || 10;

    // Constants
    const annualReturnRate = 0.05; // 5% annual return
    const inflationRate = 0.02; // 2% inflation
    const workUntilAge = fireAge;
    const lifeExpectancy = 100;

    // Calculate annual expenses
    const baseMonthlyExpenses = 25; // 基本生活費
    const totalMonthlyExpenses = baseMonthlyExpenses + monthlyHousing;
    const annualExpenses = totalMonthlyExpenses * 12;

    // Calculate annual investment (simple model)
    const annualInvestment = (startIncome - (annualExpenses / 10000)) * 0.3; // 30% of net income

    // Timeline simulation
    const assetTimeline = [];
    const cashflow = [];
    let currentAssets = startAssets * 10000; // Convert to actual amount
    let fireAchievementAge = null;

    for (let age = startAge; age <= lifeExpectancy; age++) {
      const yearIndex = age - startAge;
      let annualIncome = 0;
      let annualExpensesAdjusted = annualExpenses * 10000 * Math.pow(1 + inflationRate, yearIndex);

      if (age < workUntilAge) {
        annualIncome = startIncome * 10000 * Math.pow(1 + 0.02, yearIndex); // 2% income growth
      } else if (fireType === 'side') {
        annualIncome = fireMonthlyIncome * 10000 * 12;
      }

      // Asset growth
      const investmentReturn = currentAssets * annualReturnRate;
      const netInvestment = age < workUntilAge ? annualInvestment * 10000 : 0;
      const yearlyTax = (annualIncome + investmentReturn) * 0.15; // Simplified tax

      currentAssets = currentAssets * (1 + annualReturnRate) + netInvestment - annualExpensesAdjusted - yearlyTax;

      // Check FIRE achievement
      if (
        age >= fireAge &&
        currentAssets >= annualExpensesAdjusted * 25 &&
        !fireAchievementAge
      ) {
        fireAchievementAge = age;
      }

      assetTimeline.push({
        age,
        assets: Math.max(0, currentAssets),
      });

      if (yearIndex < 20) {
        // First 20 years for cashflow table
        cashflow.push({
          age,
          income: Math.max(0, annualIncome / 10000),
          expenses: annualExpensesAdjusted / 10000,
          assets: Math.max(0, currentAssets),
        });
      }
    }

    // Calculate education costs
    const educationCosts = this.calculateEducationCosts(childCount, educationType);

    // Generate life events
    const lifeEvents = this.generateLifeEvents(startAge, fireAge, childCount, educationType);

    return {
      fireAchievementAge,
      fireAchievementRate: fireAchievementAge
        ? Math.min((fireAchievementAge - startAge) / (fireAge - startAge), 1)
        : 0,
      assetsAt95: assetTimeline[95 - startAge]?.assets || currentAssets,
      assetLifespan: currentAssets > 0 ? '確保' : '不足',
      status: fireAchievementAge ? '達成可能' : '改善必要',
      assetTimeline,
      educationCosts,
      lifeEvents,
      cashflow,
    };
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
