/**
 * FIRE 人生設計シミュレーター
 * 将来的にReact化しやすいように、機能ごとにモジュール化
 */

// ============================================
// Hints & Help Text
// ============================================
const Hints = {
  // 基本情報
  age: '現在の満年齢を入力してください。シミュレーション開始時点での年齢です。',
  income: '源泉徴収票の「支払金額」を参考にしてください。夫婦共働きの場合は夫婦合算で入力してください。',
  takehomeRate: '給与明細や家計簿から実際に手元に残る割合を計算してください。サラリーマンの場合は80%程度がおすすめです。',
  assets: '銀行・証券口座・保険など、現在保有している金融資産の合計です。住宅は含める必要はありません。',
  cashRatio: '資産全体に占める現金（銀行預金）の比率です。分からなければ50%程度がおすすめです。',

  // 配偶者情報
  hasSpouse: 'パートナーがいる場合はチェックしてください。配偶者の詳細情報を入力できます。',
  spouseAge: 'パートナーの満年齢を入力してください。',
  spouseIncome: 'パートナーの年収を入力してください。就業していない場合や不明な場合はスキップできます。',
  spouseWorksAfterFire: 'FIRE達成後もパートナーが仕事を続ける場合はチェックしてください。',

  // 住まい
  housingType: '現在の住まいの形態を選択してください。',
  monthlyHousing: '家賃または住宅ローン返済額の毎月支払額を入力してください。',

  // 住宅ローン
  loanType: '住宅ローンの金利タイプです。契約書や銀行アプリで確認できます。',
  loanRate: '金融機関の返済予定表から確認できます。分からなければ1.0%程度を目安に。',
  loanYears: '返済予定表から、あと何年返済が続くか確認してください。',

  // 資産形成
  monthlyInvestment: 'NISA・iDeCo・投資信託など、毎月積み立てている金額を入力してください。ボーナス払いは含めず、毎月コンスタントな額を。',
  returnRate: '将来の投資リターンの仮定です。迷ったら4%（標準）をおすすめします。',
  returnRateCustom: '自分で設定したい利回りを入力してください。',

  // FIRE計画
  fireAge: '働かなくても生活できる目標年齢を想定してください。',
  fireType: '完全に仕事を辞めるか、少し働き続けるか選択してください。',
  fireMonthlyIncome: 'セミリタイア後の副業・配当などで得られる月間収入を入力してください。',

  // 子ども・教育
  childCount: 'お子さんの人数を選択してください。教育費の計算に使います。',
  educationType: '公立か私立かで教育費が大きく変わります。見通す方針を選択してください。',
};

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
        { id: 'age', label: '現在の年齢', type: 'number', min: 18, max: 100, unit: '歳', placeholder: '35', hint: Hints.age },
        { id: 'income', label: '世帯年収', type: 'number', min: 0, unit: '万円', placeholder: '500', hint: Hints.income },
        { id: 'assets', label: '現在の資産', type: 'number', min: 0, unit: '万円', placeholder: '300', hint: Hints.assets },
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
          hint: Hints.childCount,
        },
      ],
    },
    {
      title: 'これから',
      question: 'どんなふうに働き方を変えたいですか',
      rationale: '目標とする年齢とFIREのかたちで、必要な準備が変わります。',
      fields: [
        { id: 'fireAge', label: 'FIRE達成目標年齢', type: 'number', min: 25, max: 70, unit: '歳', placeholder: '45', hint: Hints.fireAge },
        {
          id: 'fireType',
          label: 'FIREのタイプ',
          type: 'select',
          options: { full: '完全FIRE', side: 'サイドFIRE' },
          hint: Hints.fireType,
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
        { id: 'age', label: '現在の年齢', type: 'number', min: 18, max: 100, unit: '歳', placeholder: '35', hint: Hints.age },
        { id: 'income', label: '世帯年収（税込）', type: 'number', min: 0, unit: '万円', placeholder: '500', hint: Hints.income },
        { id: 'takehomeRate', label: '手取り率（%）', type: 'number', min: 50, max: 100, step: 1, unit: '%', placeholder: '80', info: '給与明細や家計簿から手元に残る割合を推定してください。', recommend: 80, recommendLabel: 'おすすめ: 80%', hint: Hints.takehomeRate },
        { id: 'assets', label: '現在の資産', type: 'number', min: 0, unit: '万円', placeholder: '300', hint: Hints.assets },
        { id: 'cashRatio', label: '現金比率（%）', type: 'number', min: 0, max: 100, unit: '%', placeholder: '60', info: 'スキップ可能', recommend: 50, recommendLabel: 'おすすめ: 50%', hint: Hints.cashRatio },
      ],
    },
    {
      title: '配偶者情報',
      question: 'ご家族について教えてください',
      rationale: '配偶者の年齢・収入・働き方は、今後の資産形成を大きく左右します。',
      fields: [
        {
          id: 'hasSpouse',
          label: '配偶者がいる',
          type: 'checkbox',
          hint: Hints.hasSpouse,
        },
        { id: 'spouseAge', label: '配偶者の年齢', type: 'number', min: 18, max: 100, unit: '歳', placeholder: '32', conditional: 'hasSpouse', required: 'hasSpouse', hint: Hints.spouseAge },
        { id: 'spouseIncome', label: '配偶者の年収', type: 'number', min: 0, unit: '万円', placeholder: '350', conditional: 'hasSpouse', info: 'スキップ可能', recommend: 0, recommendLabel: 'おすすめ: 0万円', hint: Hints.spouseIncome },
        {
          id: 'spouseWorksAfterFire',
          label: 'FIRE達成後も配偶者は就業継続',
          type: 'checkbox',
          conditional: 'hasSpouse',
          hint: Hints.spouseWorksAfterFire,
        },
      ],
    },
    {
      title: '住まい',
      question: 'いまの住まいについて教えてください',
      rationale: '住宅費は家計の大きな固定費です。将来の負担を見ます。',
      fields: [
        {
          id: 'housingType',
          label: '住まいのタイプ',
          type: 'select',
          options: { rent: '賃貸', own: '持ち家（ローン完済）', owned: '住宅ローン返済中' },
          hint: Hints.housingType,
        },
        { id: 'monthlyHousing', label: '月額住宅費', type: 'number', min: 0, unit: '万円', placeholder: '10', info: 'スキップ可能', recommend: 0, recommendLabel: 'おすすめ: 0万円', hint: Hints.monthlyHousing },
      ],
    },
    {
      title: '住宅ローン',
      question: '住宅ローンの条件を教えてください',
      rationale: '金利と残り期間で、将来の支出の形が変わります。',
      conditional: 'owned',
      fields: [
        {
          id: 'loanType',
          label: 'ローンタイプ',
          type: 'select',
          options: { fixed: '全期間固定', variable: '変動金利', hybrid: '固定期間終了後変動' },
          hint: Hints.loanType,
        },
        { id: 'loanRate', label: '金利', type: 'number', min: 0, max: 10, step: 0.1, unit: '%', placeholder: '2.5', info: 'スキップ可能', recommend: 1.0, recommendLabel: 'おすすめ: 1.0%', hint: Hints.loanRate },
        { id: 'loanYears', label: '残年数', type: 'number', min: 1, max: 50, unit: '年', placeholder: '30', info: 'スキップ可能', hint: Hints.loanYears },
      ],
    },
    {
      title: '子ども情報',
      question: 'お子さんについて教えてください',
      rationale: '人数と年齢で、教育費のピークを見通します。',
      fields: [
        {
          id: 'childCount',
          label: 'お子さんの人数',
          type: 'select',
          options: { 0: 'いない', 1: '1人', 2: '2人', 3: '3人', 4: '4人以上' },
          hint: Hints.childCount,
        },
        {
          id: 'children',
          label: 'お子さんの詳細情報',
          type: 'custom',
          render: 'renderChildrenForm',
          conditional: 'childCount',
          conditionValue: (val) => val > 0,
        },
      ],
    },
    {
      title: '教育の方針',
      question: 'お子さんの教育方針を教えてください',
      rationale: '公立か私立かで、教育費が大きく変わります。',
      fields: [
        {
          id: 'educationType',
          label: '教育方針',
          type: 'select',
          options: { public: '公立中心', mixed: '一部私立', private: '私立重視' },
          info: 'スキップ可能（公立中心で計算）',
          hint: Hints.educationType,
        },
      ],
    },
    {
      title: '資産形成',
      question: 'どのくらい投資にまわせそうですか',
      rationale: '毎月の積立と想定利回りが、将来の資産の伸びを決めます。',
      fields: [
        { id: 'monthlyInvestment', label: '毎月の投資額', type: 'number', min: 0, unit: '万円', placeholder: '5', info: 'スキップ可能', recommend: 3, recommendLabel: 'おすすめ: 3万円', hint: Hints.monthlyInvestment },
        {
          id: 'returnRate',
          label: '想定年利',
          type: 'select',
          options: { '0.03': '3%（保守的）', '0.04': '4%（標準）', '0.05': '5%（積極的）', 'custom': 'カスタム' },
          hint: Hints.returnRate,
        },
        { id: 'returnRateCustom', label: 'カスタム年利', type: 'number', min: 0, max: 20, step: 0.1, unit: '%', placeholder: '4', conditional: 'returnRateCustom', recommend: 4, recommendLabel: 'おすすめ: 4%', hint: Hints.returnRateCustom },
      ],
    },
    {
      title: 'FIRE計画',
      question: 'どんなふうに働き方を変えたいですか',
      rationale: '目標年齢とFIREのかたちで、必要な準備が変わります。',
      fields: [
        { id: 'fireAge', label: 'FIRE達成目標年齢', type: 'number', min: 25, max: 70, unit: '歳', placeholder: '45', hint: Hints.fireAge },
        {
          id: 'fireType',
          label: 'FIREのタイプ',
          type: 'select',
          options: { full: '完全FIRE（労働なし）', side: 'サイドFIRE（月収あり）' },
          hint: Hints.fireType,
        },
        { id: 'fireMonthlyIncome', label: 'FIRE後の月収（サイドFIREの場合）', type: 'number', min: 0, unit: '万円', placeholder: '10', conditional: 'fireType', conditionValue: (val) => val === 'side', recommend: 10, recommendLabel: 'おすすめ: 10万円', hint: Hints.fireMonthlyIncome },
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

  currency(man) {
    return this.money(man);
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
        // バリデーション失敗をコンソール出力
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

    document.getElementById('result-modal').querySelector('.result-modal__close').addEventListener('click', () => {
      this.closeModal();
    });
    document.getElementById('result-modal').querySelector('.result-modal__backdrop').addEventListener('click', () => {
      this.closeModal();
    });
  },

  // スクロールを先頭へ。入力画面は内部スクロール器(.input-scroll)を、
  // それ以外はウィンドウ/ドキュメントをリセット（iOS Safari対策）。
  resetScroll() {
    window.scrollTo(0, 0);
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
    const active = document.querySelector('.screen--active');
    if (active) {
      active.scrollTop = 0;
    }
    document.querySelectorAll('.input-scroll, #result-screen').forEach((el) => {
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

    // Update header
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

    // Update progress bar
    const progress = ((State.currentStep + 1) / totalSteps) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    // Render form fields
    const form = document.getElementById('input-form');
    form.innerHTML = '';

    currentStep.fields.forEach((field) => {
      // カスタムレンダリング（お子さん詳細フォーム）
      if (field.type === 'custom') {
        if (field.render === 'renderChildrenForm') {
          UI.renderChildrenForm(form);
        }
        return;
      }

      const group = document.createElement('div');
      group.className = 'form-group';
      group.id = 'form-group-' + field.id;

      // 条件付きフィールドの初期表示制御
      if (field.conditional) {
        const conditionalValue = State.getInput(field.conditional);
        if (!conditionalValue) {
          group.style.display = 'none';
        }
      }

      let label, input;

      if (field.type === 'checkbox') {
        // チェックボックスの場合
        input = document.createElement('input');
        input.className = 'form-checkbox';
        input.type = 'checkbox';
        input.id = 'form-' + field.id;
        input.checked = State.getInput(field.id) ? true : false;
        input.addEventListener('change', (e) => {
          State.setInput(field.id, e.target.checked ? 'true' : '');
          // チェックボックスの変更時に条件付きフィールドを表示・非表示に
          UI.updateConditionalFields(currentStep.fields, form);
        });

        label = document.createElement('label');
        label.className = 'form-label form-label--checkbox';
        label.htmlFor = 'form-' + field.id;
        label.appendChild(input);

        const labelText = document.createElement('span');
        labelText.textContent = field.label;
        label.appendChild(labelText);

        if (field.hint) {
          const hintBtn = document.createElement('button');
          hintBtn.type = 'button';
          hintBtn.className = 'btn-hint btn-hint--inline';
          hintBtn.textContent = '?';
          hintBtn.title = field.hint;
          hintBtn.addEventListener('click', (e) => {
            e.preventDefault();
            UI.showHint(field.label, field.hint);
          });
          label.appendChild(hintBtn);
        }

        group.appendChild(label);
      } else if (field.type === 'select') {
        // ラベル + 「?」「おすすめ」ボタン
        const labelWrapper = document.createElement('div');
        labelWrapper.className = 'form-label-row';

        label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = field.label;
        labelWrapper.appendChild(label);

        if (field.hint) {
          const hintBtn = document.createElement('button');
          hintBtn.type = 'button';
          hintBtn.className = 'btn-hint';
          hintBtn.textContent = '?';
          hintBtn.title = field.hint;
          hintBtn.addEventListener('click', (e) => {
            e.preventDefault();
            UI.showHint(field.label, field.hint);
          });
          labelWrapper.appendChild(hintBtn);
        }

        if (field.recommend !== undefined) {
          const recommendBtn = document.createElement('button');
          recommendBtn.type = 'button';
          recommendBtn.className = 'btn-recommend';
          recommendBtn.textContent = 'おすすめ';
          recommendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('form-' + field.id).value = field.recommend;
            State.setInput(field.id, field.recommend);
            State.setInput(field.id + '_isRecommended', 'true');
          });
          labelWrapper.appendChild(recommendBtn);
        }

        group.appendChild(labelWrapper);

        input = document.createElement('select');
        input.className = 'form-select';
        input.id = 'form-' + field.id;
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
          // 年利やFIREタイプ変更時に条件付きフィールドを更新
          UI.updateConditionalFields(currentStep.fields, form);
        });

        group.appendChild(label);
        group.appendChild(input);

        if (field.info) {
          const info = document.createElement('small');
          info.className = 'form-hint';
          info.textContent = field.info;
          group.appendChild(info);
        }
      } else {
        // テキスト/数値入力
        // ラベル + 「?」「おすすめ」ボタン
        const labelWrapper = document.createElement('div');
        labelWrapper.className = 'form-label-row';

        label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = field.label;
        labelWrapper.appendChild(label);

        if (field.hint) {
          const hintBtn = document.createElement('button');
          hintBtn.type = 'button';
          hintBtn.className = 'btn-hint';
          hintBtn.textContent = '?';
          hintBtn.title = field.hint;
          hintBtn.addEventListener('click', (e) => {
            e.preventDefault();
            UI.showHint(field.label, field.hint);
          });
          labelWrapper.appendChild(hintBtn);
        }

        if (field.recommend !== undefined) {
          const recommendBtn = document.createElement('button');
          recommendBtn.type = 'button';
          recommendBtn.className = 'btn-recommend';
          recommendBtn.textContent = 'おすすめ';
          recommendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('form-' + field.id).value = field.recommend;
            State.setInput(field.id, field.recommend);
            State.setInput(field.id + '_isRecommended', 'true');
          });
          labelWrapper.appendChild(recommendBtn);
        }

        group.appendChild(labelWrapper);

        input = document.createElement('input');
        input.className = 'form-input';
        input.type = field.type;
        input.id = 'form-' + field.id;
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

        // 条件付きフィールド用ID設定
        group.id = 'form-group-' + field.id;

        // 条件付きフィールドは初期状態で非表示
        if (field.conditional) {
          const condValue = State.getInput(field.conditional);
          let shouldShow = false;
          if (typeof field.conditionValue === 'function') {
            shouldShow = field.conditionValue(condValue);
          } else {
            shouldShow = condValue !== undefined && condValue !== '' && condValue !== 'false';
          }
          group.style.display = shouldShow ? 'flex' : 'none';
        }

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
          group.appendChild(wrapper);
        } else {
          group.appendChild(input);
        }

        if (field.info) {
          const info = document.createElement('small');
          info.className = 'form-hint';
          info.textContent = field.info;
          group.appendChild(info);
        }
      }

      form.appendChild(group);
    });

    // Update button states
    document.getElementById('prev-btn').style.display = State.currentStep === 0 ? 'none' : 'flex';
    const isLastStep = State.currentStep === totalSteps - 1;
    document.getElementById('next-btn').textContent = isLastStep ? '結果を見る →' : '次へ →';

    // 年利フィールドの表示切り替え
    this.updateReturnRateVisibility();

    // スクロールはDOM更新完了後に実行（ブラウザ再フロー完了を待つ）
    requestAnimationFrame(() => this.resetScroll());
  },

  updateReturnRateVisibility() {
    const customGroup = document.getElementById('form-group-returnRateCustom');
    if (customGroup) {
      customGroup.style.display = State.getInput('returnRate') === 'custom' ? 'flex' : 'none';
    }
  },

  updateConditionalFields(fields, form) {
    fields.forEach((field) => {
      if (field.conditional) {
        const group = document.getElementById('form-group-' + field.id);
        if (!group) return;

        const condValue = State.getInput(field.conditional);
        let shouldShow = false;

        if (typeof field.conditionValue === 'function') {
          shouldShow = field.conditionValue(condValue);
        } else {
          shouldShow = condValue !== undefined && condValue !== '' && condValue !== 'false';
        }

        group.style.display = shouldShow ? 'flex' : 'none';

        // カスタム年利など複数の条件をサポート
        if (field.id === 'returnRateCustom' && State.getInput('returnRate') === 'custom') {
          group.style.display = 'flex';
        } else if (field.id === 'fireMonthlyIncome' && State.getInput('fireType') === 'side') {
          group.style.display = 'flex';
        }
      }
    });
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

      // お子さんのセクション
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

      // 年齢入力
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

      // 進学予定
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
      // ステップ自体の条件チェック
      if (currentStep.conditional) {
        const condValue = State.getInput(currentStep.conditional);
        const isConditionMet = currentStep.conditional === 'childCount'
          ? parseInt(condValue) > 0
          : condValue === 'owned';
        if (!isConditionMet) continue;
      }

      // カスタムフィールドは独自バリデーション
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

      // フィールド条件チェック
      if (field.conditional) {
        const condValue = State.getInput(field.conditional);
        let isFieldConditionMet = false;

        if (typeof field.conditionValue === 'function') {
          isFieldConditionMet = field.conditionValue(condValue);
        } else {
          isFieldConditionMet = condValue !== undefined && condValue !== '' && condValue !== 'false';
        }

        if (!isFieldConditionMet) {
          continue;
        }
      }

      const el = document.getElementById('form-' + field.id);
      if (!el) {
        console.warn(`Skipping field ${field.id} - element not found`);
        continue;
      }

      const value = field.type === 'checkbox' ? (el.checked ? 'true' : '') : el.value;

      // 必須フィールド（requiredフラグまたはconditionalで表示されているフィールド）
      const isRequired = field.required || (field.conditional && State.getInput(field.conditional));
      if (isRequired && (!value || String(value).trim() === '')) {
        alert(`${field.label}を入力してください`);
        el.focus();
        return false;
      }

      // 値を保存
      State.setInput(field.id, value);
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
    // FIRE gauge — SVG弧でなめらかに描画
    const percentage = Math.min(Math.round(results.fireAchievementRate * 100), 100);

    const arc = document.getElementById('gauge-arc');
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (arc) {
      const r = arc.r.baseVal.value;
      const circumference = 2 * Math.PI * r;
      arc.style.strokeDasharray = String(circumference);
      // 初期は空、次フレームで目標値へ（transitionで弧が伸びる）
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

    // 数字を 0 → percentage にカウントアップ
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
        (item, index) => `
      <div class="education-item" role="button" tabindex="0" data-index="${index}">
        <div class="education-item__year">${item.childIndex}番目のお子さん ${item.stage}</div>
        <div class="education-item__amount">${item.cost}万円</div>
      </div>
    `
      )
      .join('');
    container.innerHTML = html;

    document.querySelectorAll('#education-summary .education-item').forEach((el, index) => {
      el.addEventListener('click', () => {
        this.openEducationModal(educationCosts[index].childIndex + '番目 ' + educationCosts[index].stage, educationCosts[index].cost + '万円');
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.openEducationModal(educationCosts[index].childIndex + '番目 ' + educationCosts[index].stage, educationCosts[index].cost + '万円');
        }
      });
    });
  },

  renderTimeline(lifeEvents) {
    const container = document.getElementById('timeline');
    if (!lifeEvents || lifeEvents.length === 0) {
      container.innerHTML = '<p>イベント予定がありません</p>';
      return;
    }

    const html = lifeEvents
      .map(
        (event, index) => `
      <div class="timeline-item" role="button" tabindex="0" data-index="${index}">
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

    document.querySelectorAll('#timeline .timeline-item').forEach((el, index) => {
      el.addEventListener('click', () => {
        this.openTimelineModal(index, lifeEvents[index]);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.openTimelineModal(index, lifeEvents[index]);
        }
      });
    });
  },

  renderCashflowTable(cashflow) {
    const container = document.getElementById('cashflow-table');
    if (!cashflow || cashflow.length === 0) {
      container.innerHTML = '<p>データがありません</p>';
      return;
    }

    const visibleRows = cashflow.slice(0, 10);
    // 配偶者情報を持つ行があるかチェック
    const hasSpouseData = visibleRows.some(row => row.spouseIncome !== undefined);

    let tableHTML;
    if (hasSpouseData) {
      tableHTML = `
        <table class="cashflow-table">
          <thead>
            <tr>
              <th>年齢</th>
              <th>本人年収</th>
              <th>配偶者年収</th>
              <th>合計年収</th>
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
                <td>${row.myIncome.toLocaleString('ja-JP')}万</td>
                <td>${row.spouseIncome.toLocaleString('ja-JP')}万</td>
                <td>${row.income.toLocaleString('ja-JP')}万</td>
                <td>${row.expenses.toLocaleString('ja-JP')}万</td>
                <td>${Format.money(row.assets)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else {
      tableHTML = `
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
      `;
    }
    container.innerHTML = tableHTML + (cashflow.length > 10 ? '<p style="color: var(--color-medium-gray); font-size: var(--font-size-sm); margin-top: var(--spacing-md);">以降のデータは省略しています</p>' : '');
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
    const monthlyInvestment = parseInt(inputs.monthlyInvestment, 10) || 0; // 万円/月
    const loanType = inputs.loanType || 'fixed';
    const loanRate = parseFloat(inputs.loanRate) || 2.5; // %
    const loanYears = parseInt(inputs.loanYears, 10) || 35;

    // 配偶者情報
    const hasSpouse = inputs.hasSpouse === 'true';
    const spouseAge = parseInt(inputs.spouseAge, 10) || startAge;
    const spouseIncome = parseInt(inputs.spouseIncome, 10) || 0;
    const spouseWorksAfterFire = inputs.spouseWorksAfterFire === 'true';

    // 投資年利：選択値またはカスタム値
    let returnRate = 0.04; // デフォルト
    if (inputs.returnRate && inputs.returnRate !== 'custom') {
      returnRate = parseFloat(inputs.returnRate);
    } else if (inputs.returnRate === 'custom' && inputs.returnRateCustom) {
      returnRate = parseFloat(inputs.returnRateCustom) / 100;
    }

    // お子さんの詳細情報（子ども別計算用）
    let childrenData = [];
    if (inputs.children) {
      try {
        childrenData = JSON.parse(inputs.children);
      } catch (e) {
        childrenData = [];
      }
    }

    // 前提（ざっくりMVP・控えめな数値）
    const inflationRate = 0.015; // インフレ1.5%
    const incomeGrowth = 0.01; // 賃金上昇1%/年
    const taxRate = 0.18; // 税・社会保険ざっくり18%（労働収入のみ）
    const baseMonthlyLiving = 22; // 住居費を除く基本生活費（万円/月）
    const lifeEnd = 95;

    // 教育費を子ども別・年齢別で計算
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

      // 本人の労働収入（統一式：完全FIRE=0／サイドFIRE=月収×12）
      let myLaborIncome;
      if (age < fireAge) {
        myLaborIncome = income * Math.pow(1 + incomeGrowth, yr);
      } else if (fireType === 'side') {
        myLaborIncome = fireMonthlyIncome * 12;
      } else {
        myLaborIncome = 0;
      }

      // 配偶者の労働収入
      let spouseLaborIncomeAmount = 0;
      if (hasSpouse) {
        spouseLaborIncomeAmount = this.calculateSpouseLaborIncome(age, spouseAge, spouseIncome, fireAge, spouseWorksAfterFire, startAge);
      }

      const laborIncome = myLaborIncome + spouseLaborIncomeAmount;
      const tax = laborIncome * taxRate;

      const inflationFactor = Math.pow(1 + inflationRate, yr);
      const baseLiving = (baseMonthlyLiving + monthlyHousing) * 12 * inflationFactor;
      const educationCost = educationByAge[age] || 0;
      const living = baseLiving + educationCost;

      // 毎月の投資を12倍にして年投資額に（fireAge以前のみ）
      const annualInvestment = age < fireAge ? monthlyInvestment * 12 : 0;

      // 統一式：翌年資産 = 前年資産×(1+年利) + 労働収入 + 投資 − 生活費 − 税金
      const startOfYearAssets = assets;
      assets = startOfYearAssets * (1 + returnRate) + laborIncome + annualInvestment - living - tax;

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
          myIncome: Math.round(myLaborIncome),
          spouseIncome: Math.round(spouseLaborIncomeAmount),
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
      lifeEvents: this.generateLifeEvents(startAge, fireAge, childCount, educationType, hasSpouse, spouseAge, spouseWorksAfterFire),
      cashflow,
    };
  },

  // 子ども別・進学先別の詳細な教育費スケジュール
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

      // 中学(12-14歳→3年) / 高校(15-17歳→3年) / 大学(18-21歳→4年)
      const stages = [
        { ageStart: 12, years: 3, total: costs.middle },
        { ageStart: 15, years: 3, total: costs.high },
        { ageStart: 18, years: 4, total: costs.university },
      ];

      stages.forEach((stage) => {
        const perYear = stage.total / stage.years;
        for (let y = 0; y < stage.years; y++) {
          // 子の現在年齢から相対的に計算
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

  // 教育費の発生スケジュール（旧：簡易版用のフォールバック）
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

  generateLifeEvents(startAge, fireAge, childCount, educationType, hasSpouse, spouseAge, spouseWorksAfterFire) {
    const events = [];

    events.push({
      age: fireAge,
      year: new Date().getFullYear() + (fireAge - startAge),
      label: 'FIRE達成予定',
    });

    // 配偶者退職イベント
    if (hasSpouse && !spouseWorksAfterFire) {
      events.push({
        age: fireAge,
        year: new Date().getFullYear() + (fireAge - startAge),
        label: '配偶者が退職',
      });
    }

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

  calculateSpouseLaborIncome(age, spouseAge, spouseIncome, fireAge, spouseWorksAfterFire, startAge) {
    // Calculate spouse's current age at this year
    const currentSpouseAge = spouseAge + (age - startAge);

    // If spouse has already reached 65, they're retired
    if (currentSpouseAge >= 65) return 0;

    // ケース1: FIRE達成時に配偶者も退職（spouseWorksAfterFireがfalse）
    if (!spouseWorksAfterFire) {
      if (age < fireAge) return spouseIncome;
      // FIRE達成後は収入なし
      return 0;
    }

    // ケース2: 配偶者が継続就業
    if (spouseWorksAfterFire) {
      return spouseIncome;
    }

    return 0;
  },

  openTimelineModal(index, event) {
    if (!event) return;

    const modal = document.getElementById('result-modal');
    const title = modal.querySelector('#modal-title');
    const body = modal.querySelector('.result-modal__body');

    title.textContent = event.label;
    body.innerHTML = `<p>${event.age}歳（${event.year}年）のイベントです。</p>`;

    modal.setAttribute('aria-hidden', 'false');
  },

  openEducationModal(year, amount) {
    const modal = document.getElementById('result-modal');
    const title = modal.querySelector('#modal-title');
    const body = modal.querySelector('.result-modal__body');

    title.textContent = `${year}`;
    body.innerHTML = `<p><strong>${Format.currency(amount)}</strong></p>`;

    modal.setAttribute('aria-hidden', 'false');
  },

  closeModal() {
    const modal = document.getElementById('result-modal');
    modal.setAttribute('aria-hidden', 'true');
  },

  showHint(title, text) {
    const modal = document.getElementById('result-modal');
    const titleEl = modal.querySelector('#modal-title');
    const body = modal.querySelector('.result-modal__body');

    titleEl.textContent = 'ご説明';
    body.innerHTML = `<p><strong>${title}</strong></p><p>${text}</p>`;

    modal.setAttribute('aria-hidden', 'false');
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
