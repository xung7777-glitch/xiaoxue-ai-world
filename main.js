/**
 * ============================================================================
 * 《小雪 AI 世界》母系統核心邏輯 (main.js)
 * 版本：v2.3.0 (小雪英咒寶典雙大模組架構升級版)
 * 核心升級：
 *   1. 徹底移除子介面寶石系統，專注純粹語言修煉
 *   2. 打造雙層乾淨大殿入口（單句法咒修煉 ⟷ 組合法咒情境對話）
 *   3. 單句法咒：支援自由指定任意起始節點(#001~#800滑桿/微調)、800卷全開、靈槽填空、發音朗讀
 *   4. 組合法咒：50場真實情境對話(10大主題分類)、A2/B2雙實戰難度、雙人對話氣泡流與語音連播
 *   5. 直載資料引擎 (window.SPELLBOOK_BUNDLE)：免 CORS 限制，本機秒開
 * ============================================================================
 */

// 立即執行函式保護作用域
(function () {
  'use strict';

  /* ==========================================================================
     【一、設定區 (Configuration & State)】
     ========================================================================== */
  const SYSTEM_CONFIG = {
    baseWidth: 430,       // 手機版標準基準寬度
    baseHeight: 932,      // 手機版標準基準高度
    configPath: 'config.json' // 母系統設定檔路徑
  };

  // 10 大情境主題定義
  const SCENARIO_CATEGORIES = [
    { id: 'all', zh: '全部場景' },
    { id: 'travel', zh: '旅行交通' },
    { id: 'accommodation', zh: '飯店住宿' },
    { id: 'dining', zh: '餐飲美食' },
    { id: 'shopping', zh: '休閒購物' },
    { id: 'emergency', zh: '生活緊急' },
    { id: 'work', zh: '學習工作' },
    { id: 'social', zh: '社交互動' },
    { id: 'finance', zh: '金錢服務' },
    { id: 'info', zh: '資訊詢問' },
    { id: 'problem_solving', zh: '問題處理' }
  ];

  // 全域執行時期狀態
  const AppState = {
    configData: null,
    currentScene: 'scene-cave', // 'scene-cave' | 'scene-world-map' | 'scene-dlc-spellbook'
    isLoggedIn: false,
    currentUser: {
      displayName: '修仙道友',
      realm: '煉氣初期',
      level: 1,
      exp: 120,
      expRequired: 300,
      spiritStone: 88,
      beastDefeated: 0,
      wordsLearned: 0
    }
  };

  // DLC 英咒寶典執行時期狀態機
  const SpellbookState = {
    currentSubview: 'subview-spellbook-hub', // 'subview-spellbook-hub' | 'subview-single-spells' | 'subview-combo-dialogues'
    isLoaded: false,
    // 單句題庫資料
    sentencesList: [],
    currentSentenceIndex: 0,
    targetSlots: [],
    wordPool: [],
    isTranslationHidden: false,
    isCompleted: false,
    // 組合情境對話資料
    scenariosList: [],
    currentScenarioIndex: 0,
    currentCategory: 'all',
    currentLevel: 'a2', // 'a2' | 'b2'
    isPlayingAll: false,
    activeDialogueIndex: null
  };

  // DOM 核心節點快取
  const DOM = {
    gameContainer: document.getElementById('game-container'),
    viewportWrapper: document.getElementById('viewport-wrapper'),
    sceneCave: document.getElementById('scene-cave'),
    sceneWorldMap: document.getElementById('scene-world-map'),
    sceneDlcSpellbook: document.getElementById('scene-dlc-spellbook'),
    modulesGrid: document.getElementById('modules-grid'),
    btnBackCave: document.getElementById('btn-back-cave'),
    mapPinSanctuary: document.getElementById('map-pin-sanctuary'),
    btnGoogleLogin: document.getElementById('btn-google-login'),
    loginBtnText: document.getElementById('login-btn-text'),
    userRealmText: document.getElementById('user-realm-text'),
    modalStats: document.getElementById('modal-stats'),
    btnCloseStats: document.getElementById('btn-close-stats'),

    // DLC 子視圖容器
    subviewHub: document.getElementById('subview-spellbook-hub'),
    subviewSingle: document.getElementById('subview-single-spells'),
    subviewCombo: document.getElementById('subview-combo-dialogues'),

    // 修煉大殿按鈕
    btnHubBackCave: document.getElementById('btn-hub-back-cave'),
    btnEnterSingleSpells: document.getElementById('btn-enter-single-spells'),
    btnEnterComboDialogues: document.getElementById('btn-enter-combo-dialogues'),

    // 單句修煉場按鈕與元素
    btnSingleBackHub: document.getElementById('btn-single-back-hub'),
    btnSingleRandom: document.getElementById('btn-single-random'),
    dlcSpellId: document.getElementById('dlc-spell-id'),
    displaySpellNum: document.getElementById('display-spell-num'),
    spellSlider: document.getElementById('spell-slider'),
    btnStepPrev: document.getElementById('btn-step-prev'),
    btnStepNext: document.getElementById('btn-step-next'),
    spellName: document.getElementById('spell-name'),
    spellPattern: document.getElementById('spell-pattern'),
    spellSentenceBox: document.getElementById('spell-sentence-box'),
    spellChinese: document.getElementById('spell-chinese'),
    spellLearningNote: document.getElementById('spell-learning-note'),
    spellFeedbackBanner: document.getElementById('spell-feedback-banner'),
    feedbackText: document.getElementById('feedback-text'),
    wordChipsPool: document.getElementById('word-chips-pool'),
    btnResetSlots: document.getElementById('btn-reset-slots'),
    btnToggleTranslation: document.getElementById('btn-toggle-translation'),
    btnSpellSpeak: document.getElementById('btn-spell-speak'),
    btnPrevSpell: document.getElementById('btn-prev-spell'),
    btnNextSpell: document.getElementById('btn-next-spell'),

    // 組合對話試煉場按鈕與元素
    btnComboBackHub: document.getElementById('btn-combo-back-hub'),
    comboScenarioId: document.getElementById('combo-scenario-id'),
    btnComboPlayAll: document.getElementById('btn-combo-play-all'),
    scenarioCategoryBar: document.getElementById('scenario-category-bar'),
    scenarioTitleZh: document.getElementById('scenario-title-zh'),
    scenarioTitleEn: document.getElementById('scenario-title-en'),
    scenarioSceneDesc: document.getElementById('scenario-scene-desc'),
    btnLevelA2: document.getElementById('btn-level-a2'),
    btnLevelB2: document.getElementById('btn-level-b2'),
    dialogueChatFlow: document.getElementById('dialogue-chat-flow'),
    btnPrevScenario: document.getElementById('btn-prev-scenario'),
    btnNextScenario: document.getElementById('btn-next-scenario')
  };

  /* ==========================================================================
     【二、螢幕動態智慧縮放適配引擎 (Dynamic Viewport Auto-Scale Engine)】
     ========================================================================== */
  function applyScreenAdaptation() {
    if (!DOM.gameContainer) return;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scaleX = windowWidth / SYSTEM_CONFIG.baseWidth;
    const scaleY = windowHeight / SYSTEM_CONFIG.baseHeight;
    const scale = Math.min(scaleX, scaleY);
    DOM.gameContainer.style.transform = `scale(${scale})`;
  }

  /* ==========================================================================
     【三、母系統資料加載與渲染區 (Data Loading & Rendering)】
     ========================================================================== */
  async function loadConfigData() {
    try {
      const response = await fetch(SYSTEM_CONFIG.configPath);
      if (!response.ok) throw new Error(`設定檔讀取失敗：${response.status}`);
      const data = await response.json();
      AppState.configData = data;
      renderAppFromConfig(data);
    } catch (error) {
      console.warn('【小雪 AI 世界】載入外部設定檔遇阻，啟用備援渲染：', error);
      useFallbackConfig();
    }
  }

  function renderAppFromConfig(data) {
    if (!data) return;
    if (data.user_profile) {
      AppState.currentUser = { ...AppState.currentUser, ...data.user_profile };
      updateUserUI();
    }
    if (data.hero_banner) {
      const heroTitle = document.getElementById('hero-title');
      const heroSubtitle = document.getElementById('hero-subtitle');
      if (heroTitle) heroTitle.textContent = data.hero_banner.title || '小雪起居室';
      if (heroSubtitle) heroSubtitle.textContent = data.hero_banner.subtitle || '冥想初始化';
    }
    if (data.modules && DOM.modulesGrid) {
      DOM.modulesGrid.innerHTML = '';
      data.modules.forEach(mod => {
        DOM.modulesGrid.appendChild(createModuleCardElement(mod));
      });
    }
  }

  function createModuleCardElement(mod) {
    const card = document.createElement('article');
    const isPortal = mod.id === 'world_map_portal';
    const isLinkedDlc = mod.status === 'active' || mod.type === 'dlc';

    card.className = `module-card ${isPortal ? 'portal-card' : ''} ${isLinkedDlc ? 'linked-dlc-card' : ''}`;
    card.setAttribute('data-id', mod.id);
    card.setAttribute('data-type', mod.type || 'game');

    card.innerHTML = `
      <div class="card-text-side">
        <div>
          <span class="card-icon-tag">${mod.icon || '✨'}</span>
          <h3 class="card-title">${mod.title}</h3>
        </div>
        <p class="card-subtitle">${mod.subtitle || ''}</p>
      </div>
      <div class="card-image-side">
        <img src="${mod.image}" alt="${mod.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="card-image-placeholder" style="display: none;">${mod.icon || '🌸'}</div>
      </div>
    `;

    card.addEventListener('click', () => handleModuleCardClick(mod));
    return card;
  }

  function useFallbackConfig() {
    const fallbackModules = [
      { id: "beast_zone", title: "野外獸區", subtitle: "倖存者打怪入口", icon: "🔥", image: "assets/images/card_beast_zone.jpg", type: "game" },
      { id: "fishing_river", title: "釣魚河邊", subtitle: "休閒垂釣入口", icon: "🌊", image: "assets/images/card_fishing_river.jpg", type: "relax" },
      { id: "talisman_puzzle", title: "符咒解謎", subtitle: "2048 變體玩法", icon: "📜", image: "assets/images/card_talisman_puzzle.jpg", type: "puzzle" },
      { id: "gear_puzzle", title: "機關解密", subtitle: "俄羅斯方塊變體", icon: "⚙️", image: "assets/images/card_gear_puzzle.jpg", type: "puzzle" },
      { id: "english_spells", title: "英文咒語習得", subtitle: "小雪英咒寶典 (已連結)", icon: "📜", image: "assets/images/card_english_spells.jpg", type: "dlc", target: "scene-dlc-spellbook", status: "active" },
      { id: "herb_alchemy", title: "靈田 煉丹房", subtitle: "草藥培養與丹道", icon: "🌿", image: "assets/images/card_herb_alchemy.jpg", type: "cultivation" },
      { id: "stats_panel", title: "修為 / 狀態", subtitle: "完整修為狀態面板", icon: "📊", image: "assets/images/card_stats_panel.jpg", type: "modal" },
      { id: "world_map_portal", title: "世界地圖換場傳送門", subtitle: "探索蠻荒大世界", icon: "🧭", image: "assets/images/card_portal.jpg", type: "scene_switch" }
    ];
    renderAppFromConfig({ modules: fallbackModules });
  }

  /* ==========================================================================
     【四、互動與場景切換區 (Interactions & Scene Transitions)】
     ========================================================================== */
  function handleModuleCardClick(mod) {
    if (mod.id === 'world_map_portal' || mod.type === 'scene_switch') {
      switchScene('scene-world-map');
    } else if (mod.id === 'english_spells' || mod.target === 'scene-dlc-spellbook' || mod.type === 'dlc') {
      openDlcSpellbook();
    } else if (mod.id === 'stats_panel' || mod.type === 'modal') {
      openStatsModal();
    } else {
      showToast(`已進入【${mod.title}】法陣（子模組將於下階段開放）`);
    }
  }

  function switchScene(sceneName) {
    const scenes = [DOM.sceneCave, DOM.sceneWorldMap, DOM.sceneDlcSpellbook];
    scenes.forEach(s => {
      if (!s) return;
      s.classList.remove('active');
      s.classList.add('hidden');
    });

    if (sceneName === 'scene-world-map' && DOM.sceneWorldMap) {
      DOM.sceneWorldMap.classList.remove('hidden');
      DOM.sceneWorldMap.classList.add('active');
      AppState.currentScene = 'scene-world-map';
    } else if (sceneName === 'scene-dlc-spellbook' && DOM.sceneDlcSpellbook) {
      DOM.sceneDlcSpellbook.classList.remove('hidden');
      DOM.sceneDlcSpellbook.classList.add('active');
      AppState.currentScene = 'scene-dlc-spellbook';
    } else if (DOM.sceneCave) {
      DOM.sceneCave.classList.remove('hidden');
      DOM.sceneCave.classList.add('active');
      AppState.currentScene = 'scene-cave';
    }
  }

  function openStatsModal() {
    if (DOM.modalStats) DOM.modalStats.classList.add('open');
  }

  function closeStatsModal() {
    if (DOM.modalStats) DOM.modalStats.classList.remove('open');
  }

  function updateUserUI() {
    if (DOM.userRealmText) {
      DOM.userRealmText.textContent = `當前修為：${AppState.currentUser.realm}`;
    }
    const statRealm = document.getElementById('stat-realm');
    const statExpText = document.getElementById('stat-exp-text');
    const statExpBar = document.getElementById('stat-exp-bar');
    const statStones = document.getElementById('stat-stones');
    const statBeasts = document.getElementById('stat-beasts');
    const statWords = document.getElementById('stat-words');

    if (statRealm) statRealm.textContent = AppState.currentUser.realm;
    if (statExpText) statExpText.textContent = `${AppState.currentUser.exp} / ${AppState.currentUser.expRequired} 靈氣`;
    if (statExpBar) {
      const pct = Math.min(100, Math.round((AppState.currentUser.exp / AppState.currentUser.expRequired) * 100));
      statExpBar.style.width = `${pct}%`;
    }
    if (statStones) statStones.textContent = `${AppState.currentUser.spiritStone} 顆`;
    if (statBeasts) statBeasts.textContent = `${AppState.currentUser.beastDefeated} 隻`;
    if (statWords) statWords.textContent = `${AppState.currentUser.wordsLearned} 個`;
  }

  function checkRealmBreakthrough() {
    const realms = [
      { name: '凡人', req: 100 },
      { name: '煉氣初期', req: 300 },
      { name: '煉氣中期', req: 600 },
      { name: '煉氣後期', req: 1000 },
      { name: '築基初期', req: 1800 },
      { name: '築基圓滿', req: 3000 },
      { name: '金丹真人', req: 5000 },
      { name: '化神始祖', req: 99999 }
    ];

    let currentIdx = realms.findIndex(r => r.name === AppState.currentUser.realm);
    if (currentIdx === -1) currentIdx = 1;

    if (AppState.currentUser.exp >= AppState.currentUser.expRequired) {
      if (currentIdx < realms.length - 1) {
        currentIdx++;
        AppState.currentUser.realm = realms[currentIdx].name;
        AppState.currentUser.expRequired = realms[currentIdx].req;
        showToast(`⚡ 天地感應！道基突破至【${AppState.currentUser.realm}】！`);
      }
    }
    updateUserUI();
  }

  function handleGoogleLogin() {
    if (!AppState.isLoggedIn) {
      AppState.isLoggedIn = true;
      AppState.currentUser.displayName = '雲端修仙道友';
      AppState.currentUser.realm = '煉氣中期';
      AppState.currentUser.exp = 320;
      AppState.currentUser.expRequired = 600;
      if (DOM.loginBtnText) DOM.loginBtnText.textContent = '已綁定 Google 帳號';
      updateUserUI();
      showToast('🎉 Google 帳號授權成功！道基已同步至雲端。');
    } else {
      showToast('道友您好，目前已處於登入同步狀態。');
    }
  }

  function showToast(message) {
    const existing = document.querySelector('.xianxia-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'xianxia-toast';
    toast.style.cssText = `
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(14, 25, 40, 0.94);
      border: 1px solid var(--accent-cyan);
      color: #fff;
      padding: 9px 18px;
      border-radius: 20px;
      font-size: 13px;
      letter-spacing: 0.5px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
      z-index: 999;
      pointer-events: none;
      transition: opacity 0.3s;
    `;
    toast.textContent = message;
    DOM.gameContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2400);
  }

  /* ==========================================================================
     【五、DLC 小雪英咒寶典雙大模組架構 (DLC Spellbook Dual Modules)】
     ========================================================================== */
  /**
   * 初始化並載入英咒寶典全題庫（直載資料庫優先）
   */
  function ensureSpellbookDataLoaded() {
    if (SpellbookState.isLoaded) return;

    // 優先讀取直載資料模組 window.SPELLBOOK_BUNDLE
    if (window.SPELLBOOK_BUNDLE && window.SPELLBOOK_BUNDLE.sentences) {
      SpellbookState.sentencesList = window.SPELLBOOK_BUNDLE.sentences;
      SpellbookState.scenariosList = window.SPELLBOOK_BUNDLE.scenarios || [];
      SpellbookState.isLoaded = true;
      console.log(`【小雪英咒寶典】直載資料引擎成功加載！單句：${SpellbookState.sentencesList.length} 卷，情境：${SpellbookState.scenariosList.length} 場。`);
      return;
    }

    console.warn('【小雪英咒寶典】直載包未偵測到，啟用安全預設題庫。');
    SpellbookState.sentencesList = [
      { id: 1, english: "With my own ears I clearly heard the heart beat of the nuclear bomb.", chinese: "我親耳清晰地聽到了原子彈的心臟跳動。", spell_name: "原子之心", keywords: ["nuclear","bomb","heart","beat","heard","clearly","ears"], keywords2: ["ears","clearly","heard","heart","nuclear"], pattern: "ear", learning_note: "本題訓練 ear 字母模式的快速辨識能力。" },
      { id: 2, english: "Next year the bearded bear will bear a dear baby in the rear.", chinese: "明年，長鬍子的熊將在後方生下一個可愛的小寶寶。", spell_name: "鬍熊後產", keywords: ["bearded","bear","rear","baby","dear","year"], keywords2: ["year","rear","dear","bear"], pattern: "ear", learning_note: "本組單字共享 ear 字根。" }
    ];
    SpellbookState.scenariosList = [];
    SpellbookState.isLoaded = true;
  }

  /**
   * 進入 DLC 入口
   */
  function openDlcSpellbook() {
    ensureSpellbookDataLoaded();
    switchScene('scene-dlc-spellbook');
    switchSpellbookSubview('subview-spellbook-hub');
  }

  /**
   * 子視圖平滑切換器
   */
  function switchSpellbookSubview(subviewId) {
    const subviews = [DOM.subviewHub, DOM.subviewSingle, DOM.subviewCombo];
    subviews.forEach(v => {
      if (!v) return;
      v.classList.remove('active');
      v.classList.add('hidden');
    });

    const targetView = document.getElementById(subviewId);
    if (targetView) {
      targetView.classList.remove('hidden');
      targetView.classList.add('active');
      SpellbookState.currentSubview = subviewId;
    }

    // 切換時渲染對應視圖
    if (subviewId === 'subview-single-spells') {
      renderCurrentSingleSpell();
    } else if (subviewId === 'subview-combo-dialogues') {
      renderScenarioCategories();
      renderCurrentScenario();
    }
  }

  /* --------------------------------------------------------------------------
     【模組一：單句法咒修煉核心邏輯】
     -------------------------------------------------------------------------- */
  function cleanWord(str) {
    return (str || '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').trim().toLowerCase();
  }

  /**
   * 渲染當前選定的單句法咒
   */
  function renderCurrentSingleSpell() {
    const total = SpellbookState.sentencesList.length;
    if (total === 0) return;

    if (SpellbookState.currentSentenceIndex < 0) SpellbookState.currentSentenceIndex = total - 1;
    if (SpellbookState.currentSentenceIndex >= total) SpellbookState.currentSentenceIndex = 0;

    const spell = SpellbookState.sentencesList[SpellbookState.currentSentenceIndex];
    SpellbookState.isCompleted = false;

    // 自由起點選擇器連動
    const currentNumStr = `#${String(SpellbookState.currentSentenceIndex + 1).padStart(3, '0')}`;
    if (DOM.displaySpellNum) DOM.displaySpellNum.textContent = currentNumStr;
    if (DOM.dlcSpellId) DOM.dlcSpellId.textContent = `第 ${SpellbookState.currentSentenceIndex + 1} / ${total} 卷`;
    if (DOM.spellSlider) {
      DOM.spellSlider.max = total;
      DOM.spellSlider.value = SpellbookState.currentSentenceIndex + 1;
    }

    // 經文資訊卡
    if (DOM.spellName) DOM.spellName.textContent = `法咒：${spell.spell_name || '無上真言'}`;
    if (DOM.spellPattern) DOM.spellPattern.textContent = `核心靈韻：${spell.pattern || '經典'}`;
    if (DOM.spellChinese) DOM.spellChinese.textContent = spell.chinese || '';
    if (DOM.spellLearningNote) DOM.spellLearningNote.textContent = spell.learning_note || '隨字觀心，唯手熟爾。';

    // 隱藏答對橫幅
    if (DOM.spellFeedbackBanner) DOM.spellFeedbackBanner.style.display = 'none';

    // 經文拆解與靈槽建置
    setupSingleSpellSlots(spell);
  }

  /**
   * 智慧句子拆解與靈槽建置
   */
  function setupSingleSpellSlots(spell) {
    if (!DOM.spellSentenceBox || !DOM.wordChipsPool) return;

    DOM.spellSentenceBox.innerHTML = '';
    DOM.wordChipsPool.innerHTML = '';

    const words = spell.english.split(' ');
    const candidateKeywords = (spell.keywords2 && spell.keywords2.length > 0)
      ? spell.keywords2
      : (spell.keywords || []);

    const cleanedKeywordsSet = new Set(candidateKeywords.map(k => cleanWord(k)));

    // 挑選 2~3 個關鍵詞做成空白靈槽
    const slotIndexes = [];
    words.forEach((w, idx) => {
      const cw = cleanWord(w);
      if (cleanedKeywordsSet.has(cw) && slotIndexes.length < 3) {
        slotIndexes.push(idx);
      }
    });

    if (slotIndexes.length === 0) {
      words.forEach((w, idx) => {
        if (cleanWord(w).length > 3 && slotIndexes.length < 2) slotIndexes.push(idx);
      });
    }

    SpellbookState.targetSlots = [];
    const correctWords = [];

    // 經文區渲染
    words.forEach((w, idx) => {
      if (slotIndexes.includes(idx)) {
        const cleaned = cleanWord(w);
        const slotObj = {
          slotId: `slot_${idx}`,
          targetWord: w,
          cleanedWord: cleaned,
          userWord: null,
          element: null
        };

        const slotSpan = document.createElement('span');
        slotSpan.className = 'spell-slot empty';
        slotSpan.id = slotObj.slotId;
        slotSpan.textContent = '【 靈槽 】';
        slotSpan.addEventListener('click', () => handleSlotClick(slotObj));

        slotObj.element = slotSpan;
        SpellbookState.targetSlots.push(slotObj);
        correctWords.push(cleaned);

        DOM.spellSentenceBox.appendChild(slotSpan);
      } else {
        const textNode = document.createTextNode(w + ' ');
        DOM.spellSentenceBox.appendChild(textNode);
      }
    });

    // 散落詞塊池（正確字 + 干擾字打散）
    const allPoolWords = [...correctWords];
    const candidateDistractors = (spell.keywords || []).map(k => cleanWord(k)).filter(k => !correctWords.includes(k));
    candidateDistractors.slice(0, 2).forEach(d => allPoolWords.push(d));

    // Fisher-Yates 洗牌
    for (let i = allPoolWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPoolWords[i], allPoolWords[j]] = [allPoolWords[j], allPoolWords[i]];
    }

    SpellbookState.wordPool = allPoolWords.map((word, idx) => ({
      id: `chip_${idx}`,
      word: word,
      isUsed: false,
      element: null
    }));

    // 詞塊渲染
    SpellbookState.wordPool.forEach(chip => {
      const chipBtn = document.createElement('button');
      chipBtn.className = 'word-chip';
      chipBtn.id = chip.id;
      chipBtn.textContent = chip.word;
      chipBtn.addEventListener('click', () => handleChipClick(chip));
      chip.element = chipBtn;
      DOM.wordChipsPool.appendChild(chipBtn);
    });
  }

  function handleChipClick(chip) {
    if (chip.isUsed || SpellbookState.isCompleted) return;
    const emptySlot = SpellbookState.targetSlots.find(s => s.userWord === null);
    if (!emptySlot) return;

    emptySlot.userWord = chip.word;
    emptySlot.chipId = chip.id;
    emptySlot.element.textContent = chip.word;
    emptySlot.element.className = 'spell-slot filled';

    chip.isUsed = true;
    chip.element.classList.add('used');

    checkSlotsCompletion();
  }

  function handleSlotClick(slot) {
    if (!slot.userWord || SpellbookState.isCompleted) return;
    const chip = SpellbookState.wordPool.find(c => c.id === slot.chipId);
    if (chip) {
      chip.isUsed = false;
      if (chip.element) chip.element.classList.remove('used');
    }

    slot.userWord = null;
    slot.chipId = null;
    slot.element.textContent = '【 靈槽 】';
    slot.element.className = 'spell-slot empty';

    if (DOM.spellFeedbackBanner) DOM.spellFeedbackBanner.style.display = 'none';
  }

  function resetCurrentSlots() {
    SpellbookState.targetSlots.forEach(slot => {
      slot.userWord = null;
      slot.chipId = null;
      slot.element.textContent = '【 靈槽 】';
      slot.element.className = 'spell-slot empty';
    });

    SpellbookState.wordPool.forEach(chip => {
      chip.isUsed = false;
      if (chip.element) chip.element.classList.remove('used');
    });

    if (DOM.spellFeedbackBanner) DOM.spellFeedbackBanner.style.display = 'none';
  }

  function checkSlotsCompletion() {
    const allFilled = SpellbookState.targetSlots.every(s => s.userWord !== null);
    if (!allFilled) return;

    const isAllCorrect = SpellbookState.targetSlots.every(s => s.userWord === s.cleanedWord);

    if (isAllCorrect) {
      SpellbookState.isCompleted = true;
      SpellbookState.targetSlots.forEach(s => {
        s.element.className = 'spell-slot correct';
      });

      // 道心修為累計（純淨無寶石！）
      AppState.currentUser.exp += 10;
      AppState.currentUser.wordsLearned += 1;

      if (DOM.spellFeedbackBanner && DOM.feedbackText) {
        DOM.feedbackText.textContent = `🎉 法咒圓滿！道心大振，法咒掌握 +1！`;
        DOM.spellFeedbackBanner.style.display = 'flex';
      }

      checkRealmBreakthrough();
      updateUserUI();

      const spell = SpellbookState.sentencesList[SpellbookState.currentSentenceIndex];
      if (spell) speakEnglish(spell.english);

    } else {
      SpellbookState.targetSlots.forEach(s => {
        if (s.userWord !== s.cleanedWord) {
          s.element.style.borderColor = 'var(--accent-fire)';
          setTimeout(() => { if (s.element) s.element.style.borderColor = ''; }, 600);
        }
      });
      showToast('⚠️ 靈氣運轉有滯，字塊排列尚未圓滿，請調整靈槽。');
    }
  }

  function speakEnglish(text, onEnd) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }

  function toggleTranslation() {
    if (!DOM.spellChinese || !DOM.btnToggleTranslation) return;
    SpellbookState.isTranslationHidden = !SpellbookState.isTranslationHidden;
    if (SpellbookState.isTranslationHidden) {
      DOM.spellChinese.classList.add('blur-hidden');
      DOM.btnToggleTranslation.textContent = '顯示神諭';
    } else {
      DOM.spellChinese.classList.remove('blur-hidden');
      DOM.btnToggleTranslation.textContent = '隱藏神諭';
    }
  }

  function jumpToSpellIndex(targetIdx) {
    SpellbookState.currentSentenceIndex = targetIdx;
    renderCurrentSingleSpell();
  }

  /* --------------------------------------------------------------------------
     【模組二：組合法咒（50場情境對話）核心邏輯】
     -------------------------------------------------------------------------- */
  function renderScenarioCategories() {
    if (!DOM.scenarioCategoryBar) return;
    DOM.scenarioCategoryBar.innerHTML = '';

    SCENARIO_CATEGORIES.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = `cat-chip ${cat.id === SpellbookState.currentCategory ? 'active' : ''}`;
      chip.textContent = cat.zh;
      chip.addEventListener('click', () => {
        SpellbookState.currentCategory = cat.id;
        renderScenarioCategories();
        // 切換分類後找到第一個匹配的情境
        const matchIdx = SpellbookState.scenariosList.findIndex(s => cat.id === 'all' || s.category === cat.id);
        if (matchIdx !== -1) {
          SpellbookState.currentScenarioIndex = matchIdx;
          renderCurrentScenario();
        }
      });
      DOM.scenarioCategoryBar.appendChild(chip);
    });
  }

  function renderCurrentScenario() {
    const list = SpellbookState.scenariosList;
    if (!list || list.length === 0) return;

    if (SpellbookState.currentScenarioIndex < 0) SpellbookState.currentScenarioIndex = list.length - 1;
    if (SpellbookState.currentScenarioIndex >= list.length) SpellbookState.currentScenarioIndex = 0;

    const scenario = list[SpellbookState.currentScenarioIndex];
    if (DOM.comboScenarioId) DOM.comboScenarioId.textContent = `場景 ${scenario.id || (SpellbookState.currentScenarioIndex + 1)} / ${list.length}`;
    if (DOM.scenarioTitleZh) DOM.scenarioTitleZh.textContent = scenario.title.zh || '情境試煉';
    if (DOM.scenarioTitleEn) DOM.scenarioTitleEn.textContent = scenario.title.en || 'Scenario Trial';

    // 取得當前難度內容 (a2 / b2)
    const levelData = scenario[SpellbookState.currentLevel] || scenario.a2;
    if (DOM.scenarioSceneDesc) DOM.scenarioSceneDesc.textContent = levelData.scene || '';

    // 渲染對話氣泡流
    renderDialogueChatFlow(levelData.dialogue || []);
  }

  function renderDialogueChatFlow(dialogueList) {
    if (!DOM.dialogueChatFlow) return;
    DOM.dialogueChatFlow.innerHTML = '';

    dialogueList.forEach((item, idx) => {
      const isUser = item.speaker === '旅客';
      const wrap = document.createElement('div');
      wrap.className = `chat-bubble-wrap ${isUser ? 'speaker-user' : 'speaker-staff'}`;
      wrap.id = `dialogue-bubble-${idx}`;

      wrap.innerHTML = `
        <span class="chat-speaker-label">${item.speaker}</span>
        <div class="chat-bubble">
          <div class="chat-text-en">
            <span>${item.text}</span>
            <span class="chat-audio-icon">🔊</span>
          </div>
          <div class="chat-text-zh">${item.translation || ''}</div>
        </div>
      `;

      // 點擊單句氣泡直接發音
      wrap.addEventListener('click', () => {
        speakEnglish(item.text);
      });

      DOM.dialogueChatFlow.appendChild(wrap);
    });
  }

  /**
   * 全對話連播功能
   */
  function playAllDialogues() {
    const scenario = SpellbookState.scenariosList[SpellbookState.currentScenarioIndex];
    if (!scenario) return;
    const levelData = scenario[SpellbookState.currentLevel] || scenario.a2;
    const dialogues = levelData.dialogue || [];
    if (dialogues.length === 0) return;

    SpellbookState.isPlayingAll = true;
    if (DOM.btnComboPlayAll) DOM.btnComboPlayAll.textContent = '⏹ 停止';

    let current = 0;
    function playNext() {
      if (!SpellbookState.isPlayingAll || current >= dialogues.length) {
        SpellbookState.isPlayingAll = false;
        if (DOM.btnComboPlayAll) DOM.btnComboPlayAll.textContent = '▶ 連播';
        return;
      }

      // 高亮當前氣泡
      const bubble = document.getElementById(`dialogue-bubble-${current}`);
      if (bubble) {
        bubble.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      speakEnglish(dialogues[current].text, () => {
        current++;
        setTimeout(playNext, 600); // 句間間隔 600ms
      });
    }

    playNext();
  }

  function stopPlayAllDialogues() {
    SpellbookState.isPlayingAll = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (DOM.btnComboPlayAll) DOM.btnComboPlayAll.textContent = '▶ 連播';
  }

  /* ==========================================================================
     【六、初始化區 (Initialization)】
     ========================================================================== */
  function init() {
    applyScreenAdaptation();
    window.addEventListener('resize', applyScreenAdaptation);
    window.addEventListener('orientationchange', applyScreenAdaptation);

    loadConfigData();
    ensureSpellbookDataLoaded();

    // 1. 母系統通用事件
    if (DOM.btnBackCave) {
      DOM.btnBackCave.addEventListener('click', () => switchScene('scene-cave'));
    }
    if (DOM.mapPinSanctuary) {
      DOM.mapPinSanctuary.addEventListener('click', () => switchScene('scene-cave'));
    }
    if (DOM.btnGoogleLogin) {
      DOM.btnGoogleLogin.addEventListener('click', handleGoogleLogin);
    }
    if (DOM.btnCloseStats) {
      DOM.btnCloseStats.addEventListener('click', closeStatsModal);
    }
    if (DOM.modalStats) {
      DOM.modalStats.addEventListener('click', (e) => {
        if (e.target === DOM.modalStats) closeStatsModal();
      });
    }

    // 2. DLC 修煉大殿分流事件
    if (DOM.btnHubBackCave) {
      DOM.btnHubBackCave.addEventListener('click', () => switchScene('scene-cave'));
    }
    if (DOM.btnEnterSingleSpells) {
      DOM.btnEnterSingleSpells.addEventListener('click', () => switchSpellbookSubview('subview-single-spells'));
    }
    if (DOM.btnEnterComboDialogues) {
      DOM.btnEnterComboDialogues.addEventListener('click', () => switchSpellbookSubview('subview-combo-dialogues'));
    }

    // 3. 單句法咒修煉場事件
    if (DOM.btnSingleBackHub) {
      DOM.btnSingleBackHub.addEventListener('click', () => switchSpellbookSubview('subview-spellbook-hub'));
    }
    if (DOM.btnStepPrev) {
      DOM.btnStepPrev.addEventListener('click', () => jumpToSpellIndex(SpellbookState.currentSentenceIndex - 1));
    }
    if (DOM.btnStepNext) {
      DOM.btnStepNext.addEventListener('click', () => jumpToSpellIndex(SpellbookState.currentSentenceIndex + 1));
    }
    if (DOM.spellSlider) {
      DOM.spellSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        jumpToSpellIndex(val - 1);
      });
    }
    if (DOM.btnSingleRandom) {
      DOM.btnSingleRandom.addEventListener('click', () => {
        const rnd = Math.floor(Math.random() * SpellbookState.sentencesList.length);
        jumpToSpellIndex(rnd);
      });
    }
    if (DOM.btnResetSlots) {
      DOM.btnResetSlots.addEventListener('click', resetCurrentSlots);
    }
    if (DOM.btnToggleTranslation) {
      DOM.btnToggleTranslation.addEventListener('click', toggleTranslation);
    }
    if (DOM.btnSpellSpeak) {
      DOM.btnSpellSpeak.addEventListener('click', () => {
        const spell = SpellbookState.sentencesList[SpellbookState.currentSentenceIndex];
        if (spell) speakEnglish(spell.english);
      });
    }
    if (DOM.btnPrevSpell) {
      DOM.btnPrevSpell.addEventListener('click', () => jumpToSpellIndex(SpellbookState.currentSentenceIndex - 1));
    }
    if (DOM.btnNextSpell) {
      DOM.btnNextSpell.addEventListener('click', () => jumpToSpellIndex(SpellbookState.currentSentenceIndex + 1));
    }

    // 4. 組合情境對話試煉場事件
    if (DOM.btnComboBackHub) {
      DOM.btnComboBackHub.addEventListener('click', () => {
        stopPlayAllDialogues();
        switchSpellbookSubview('subview-spellbook-hub');
      });
    }
    if (DOM.btnLevelA2) {
      DOM.btnLevelA2.addEventListener('click', () => {
        SpellbookState.currentLevel = 'a2';
        DOM.btnLevelA2.classList.add('active');
        if (DOM.btnLevelB2) DOM.btnLevelB2.classList.remove('active');
        renderCurrentScenario();
      });
    }
    if (DOM.btnLevelB2) {
      DOM.btnLevelB2.addEventListener('click', () => {
        SpellbookState.currentLevel = 'b2';
        DOM.btnLevelB2.classList.add('active');
        if (DOM.btnLevelA2) DOM.btnLevelA2.classList.remove('active');
        renderCurrentScenario();
      });
    }
    if (DOM.btnComboPlayAll) {
      DOM.btnComboPlayAll.addEventListener('click', () => {
        if (SpellbookState.isPlayingAll) stopPlayAllDialogues();
        else playAllDialogues();
      });
    }
    if (DOM.btnPrevScenario) {
      DOM.btnPrevScenario.addEventListener('click', () => {
        stopPlayAllDialogues();
        SpellbookState.currentScenarioIndex--;
        renderCurrentScenario();
      });
    }
    if (DOM.btnNextScenario) {
      DOM.btnNextScenario.addEventListener('click', () => {
        stopPlayAllDialogues();
        SpellbookState.currentScenarioIndex++;
        renderCurrentScenario();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
