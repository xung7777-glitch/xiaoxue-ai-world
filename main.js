/**
 * ============================================================================
 * 《小雪 AI 世界》母系統核心邏輯 (main.js)
 * 版本：v2.2.0 (已深度整合 DLC 小雪英咒寶典)
 * 職責：
 *   1. 螢幕動態智慧縮放適配引擎（保證手機與電腦端均等比縮放並垂直填滿螢幕）
 *   2. 非同步載入 config.json，動態渲染手機直式卡片流
 *   3. 三大多層視覺場景切換（洞府起居室 ⟷ 蠻荒仙府世界大地圖 ⟷ DLC 英咒修煉試煉場）
 *   4. Google 帳號認證狀態管理與修仙道基數值彈窗
 *   5. DLC 英咒寶典引擎：800卷真實題庫載入、靈槽挖空、真言碎片互動、語音朗讀與修為同步
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
    configPath: 'config.json', // 母系統設定檔路徑
    spellbookDataPath: 'dlcs/dlc_spellbook/src/data/sentences.json' // DLC 咒語資料路徑
  };

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

  // DLC 小雪英咒寶典執行時期狀態機
  const SpellbookState = {
    isLoaded: false,
    spellsList: [],
    currentIndex: 0,
    currentSpell: null,
    targetSlots: [],       // 目標填空靈槽 [{ word: "ears", cleaned: "ears", index: 0, isFilled: false, userWord: null }]
    wordPool: [],          // 打散後的真言碎片 [{ id: "chip_1", word: "ears", isUsed: false }]
    isTranslationHidden: false,
    isCompleted: false
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
    btnBackCaveFromDlc: document.getElementById('btn-back-cave-from-dlc'),
    mapPinSanctuary: document.getElementById('map-pin-sanctuary'),
    btnGoogleLogin: document.getElementById('btn-google-login'),
    loginBtnText: document.getElementById('login-btn-text'),
    userRealmText: document.getElementById('user-realm-text'),
    modalStats: document.getElementById('modal-stats'),
    btnCloseStats: document.getElementById('btn-close-stats'),
    
    // DLC 英咒寶典專屬節點
    dlcSpellId: document.getElementById('dlc-spell-id'),
    dlcSpiritStoneCount: document.getElementById('dlc-spirit-stone-count'),
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
    btnRandomSpell: document.getElementById('btn-random-spell')
  };

  /* ==========================================================================
     【二、螢幕動態智慧縮放適配引擎 (Dynamic Viewport Auto-Scale Engine)】
     ========================================================================== */
  /**
   * 智慧計算視窗縮放比例，使直式手機遊戲容器在任何設備上都能等比放大並垂直填滿
   */
  function applyScreenAdaptation() {
    if (!DOM.gameContainer) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 計算寬度與高度的縮放係數
    const scaleX = windowWidth / SYSTEM_CONFIG.baseWidth;
    const scaleY = windowHeight / SYSTEM_CONFIG.baseHeight;

    // 取得最佳等比縮放值（確保畫面完整納入視窗且高度盡可能垂直填滿）
    const scale = Math.min(scaleX, scaleY);

    // 套用 CSS Transform 進行等比縮放
    DOM.gameContainer.style.transform = `scale(${scale})`;
  }

  /* ==========================================================================
     【三、母系統資料加載與渲染區 (Data Loading & Rendering)】
     ========================================================================== */
  /**
   * 非同步讀取根目錄 config.json 設定檔
   */
  async function loadConfigData() {
    try {
      const response = await fetch(SYSTEM_CONFIG.configPath);
      if (!response.ok) {
        throw new Error(`設定檔讀取失敗，狀態代碼：${response.status}`);
      }
      const data = await response.json();
      AppState.configData = data;
      renderAppFromConfig(data);
    } catch (error) {
      console.warn('【小雪 AI 世界】載入外部 config.json 異常，啟用內部備援設定：', error);
      useFallbackConfig();
    }
  }

  /**
   * 依據設定檔動態渲染母系統介面卡片
   */
  function renderAppFromConfig(data) {
    if (!data) return;

    // 更新使用者狀態
    if (data.user_profile) {
      AppState.currentUser = { ...AppState.currentUser, ...data.user_profile };
      updateUserUI();
    }

    // 更新起居室 Hero 橫幅
    if (data.hero_banner) {
      const heroTitle = document.getElementById('hero-title');
      const heroSubtitle = document.getElementById('hero-subtitle');
      if (heroTitle) heroTitle.textContent = data.hero_banner.title || '小雪起居室';
      if (heroSubtitle) heroSubtitle.textContent = data.hero_banner.subtitle || '冥想初始化';
    }

    // 動態渲染雙欄功能模組卡片
    if (data.modules && DOM.modulesGrid) {
      DOM.modulesGrid.innerHTML = ''; // 清空原有佔位

      data.modules.forEach(mod => {
        const card = createModuleCardElement(mod);
        DOM.modulesGrid.appendChild(card);
      });
    }
  }

  /**
   * 產生單一功能模組卡片的 HTML 節點
   */
  function createModuleCardElement(mod) {
    const card = document.createElement('article');
    const isPortal = mod.id === 'world_map_portal';
    const isLinkedDlc = mod.status === 'active' || mod.type === 'dlc';
    
    card.className = `module-card ${isPortal ? 'portal-card' : ''} ${isLinkedDlc ? 'linked-dlc-card' : ''}`;
    card.setAttribute('data-id', mod.id);
    card.setAttribute('data-type', mod.type || 'game');

    // 組合卡片結構：左側文字標題與圖示，右側美圖插畫
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

    // 綁定卡片點擊事件
    card.addEventListener('click', () => handleModuleCardClick(mod));
    return card;
  }

  /**
   * 備援配置資料（防止本機預覽直接雙擊 index.html 時因 CORS 阻擋 fetch）
   */
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
  /**
   * 模組卡片點擊處理
   */
  function handleModuleCardClick(mod) {
    if (mod.id === 'world_map_portal' || mod.type === 'scene_switch') {
      // 切換至世界地圖
      switchScene('scene-world-map');
    } else if (mod.id === 'english_spells' || mod.target === 'scene-dlc-spellbook' || mod.type === 'dlc') {
      // 進入 DLC 小雪英咒寶典試煉場
      openDlcSpellbook();
    } else if (mod.id === 'stats_panel' || mod.type === 'modal') {
      // 開啟修為狀態面板彈窗
      openStatsModal();
    } else {
      // 其他 DLC 模組入口提示
      showToast(`已進入【${mod.title}】法陣（子模組將於下階段開放）`);
    }
  }

  /**
   * 平滑場景切換（洞府起居室 ⟷ 世界大地圖 ⟷ DLC 英咒試煉場）
   */
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

  /**
   * 開啟修為數值彈窗
   */
  function openStatsModal() {
    if (DOM.modalStats) {
      DOM.modalStats.classList.add('open');
    }
  }

  /**
   * 關閉修為數值彈窗
   */
  function closeStatsModal() {
    if (DOM.modalStats) {
      DOM.modalStats.classList.remove('open');
    }
  }

  /**
   * 更新使用者介面數值與道基狀態
   */
  function updateUserUI() {
    if (DOM.userRealmText) {
      DOM.userRealmText.textContent = `當前修為：${AppState.currentUser.realm}`;
    }
    if (DOM.dlcSpiritStoneCount) {
      DOM.dlcSpiritStoneCount.textContent = AppState.currentUser.spiritStone;
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

  /**
   * 修為突破判定引擎
   */
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
        showToast(`⚡ 天地感應！道友道基突破至【${AppState.currentUser.realm}】！`);
      }
    }
    updateUserUI();
  }

  /**
   * Google 帳號快速登入邏輯
   */
  function handleGoogleLogin() {
    if (!AppState.isLoggedIn) {
      AppState.isLoggedIn = true;
      AppState.currentUser.displayName = '雲端修仙道友';
      AppState.currentUser.realm = '煉氣中期';
      AppState.currentUser.exp = 320;
      AppState.currentUser.expRequired = 600;
      AppState.currentUser.spiritStone = 168;

      if (DOM.loginBtnText) DOM.loginBtnText.textContent = '已綁定 Google 帳號';
      updateUserUI();
      showToast('🎉 Google 帳號授權成功！道基已同步至雲端。');
    } else {
      showToast('道友您好，目前已處於登入同步狀態。');
    }
  }

  /**
   * 輕量浮動通知 (Toast)
   */
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
     【五、DLC 小雪英咒寶典修煉引擎 (DLC Spellbook Engine)】
     ========================================================================== */
  // 經典備援題庫（防止本機 file:// CORS 限制時題庫中斷）
  const FALLBACK_SPELLS = [
    {
      id: 1,
      english: "With my own ears I clearly heard the heart beat of the nuclear bomb.",
      chinese: "我親耳清晰地聽到了原子彈的心臟跳動。",
      spell_name: "原子之心",
      keywords: ["nuclear", "bomb", "heart", "beat", "heard", "clearly", "ears", "own"],
      keywords2: ["ears", "clearly", "heard", "heart", "nuclear"],
      pattern: "ear",
      learning_note: "本題訓練 ear 字母模式的快速辨識能力。學習者透過填空 hear / clear / ear 等單字，進行拼寫結構掃描訓練。"
    },
    {
      id: 2,
      english: "Next year the bearded bear will bear a dear baby in the rear.",
      chinese: "明年，長鬍子的熊將在後方生下一個可愛的小寶寶。",
      spell_name: "鬍熊後產",
      keywords: ["bearded", "bear", "rear", "baby", "dear", "year", "next"],
      keywords2: ["year", "rear", "dear", "bear", "bearded"],
      pattern: "ear",
      learning_note: "本組單字共享耳熟能詳的 ear 字根，透過辨識單字結尾的共同拼音特徵，能有效幫助記憶一系列發音相近的單字。"
    },
    {
      id: 3,
      english: "Early I searched through the earth for earthenware so as to research in earthquake.",
      chinese: "早先我搜尋泥土中的陶器以研究地震。",
      spell_name: "土陶搜震",
      keywords: ["earthquake", "earthenware", "research", "searched", "earth", "early"],
      keywords2: ["earth", "earthquake", "earthenware", "searched", "research", "early"],
      pattern: "ear",
      learning_note: "這組單字以 ear 為核心，進階延伸出 earth 相關詞彙。建議先掌握 earth（土地）再關聯 earthquake（地震）等字。"
    },
    {
      id: 4,
      english: "I learn that learned earnest men earn much by learning.",
      chinese: "我得知有學問而認真的人靠學問掙很多錢。",
      spell_name: "認真掙學",
      keywords: ["earnest", "learning", "learned", "earn", "learn", "men"],
      keywords2: ["earn", "earnest", "learn", "learned", "learning"],
      pattern: "earn",
      learning_note: "本題重點在 earn 詞族串連，earn (掙得) + earnest (認真的) + learn (學習)，快速強化字根聯想。"
    }
  ];

  /**
   * 進入 DLC 試煉場
   */
  async function openDlcSpellbook() {
    switchScene('scene-dlc-spellbook');
    updateUserUI();

    if (!SpellbookState.isLoaded) {
      await loadSpellbookData();
    }
    renderCurrentSpell();
  }

  /**
   * 非同步載入 800 卷真實咒語題庫
   */
  async function loadSpellbookData() {
    try {
      const response = await fetch(SYSTEM_CONFIG.spellbookDataPath);
      if (!response.ok) throw new Error(`題庫載入失敗：${response.status}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        SpellbookState.spellsList = data;
        SpellbookState.isLoaded = true;
        console.log(`【小雪英咒寶典】成功載入 ${data.length} 卷咒語題庫！`);
        return;
      }
    } catch (err) {
      console.warn('【小雪英咒寶典】讀取外部題庫遇阻，切換至本地高頻備援題庫：', err);
    }

    SpellbookState.spellsList = FALLBACK_SPELLS;
    SpellbookState.isLoaded = true;
  }

  /**
   * 工具函式：移除單詞標點符號便於比對
   */
  function cleanWord(str) {
    return (str || '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').trim().toLowerCase();
  }

  /**
   * 渲染當前選定的法咒題目
   */
  function renderCurrentSpell() {
    if (!SpellbookState.spellsList || SpellbookState.spellsList.length === 0) return;

    const total = SpellbookState.spellsList.length;
    if (SpellbookState.currentIndex < 0) SpellbookState.currentIndex = total - 1;
    if (SpellbookState.currentIndex >= total) SpellbookState.currentIndex = 0;

    const spell = SpellbookState.spellsList[SpellbookState.currentIndex];
    SpellbookState.currentSpell = spell;
    SpellbookState.isCompleted = false;

    // 更新頂部資訊
    if (DOM.dlcSpellId) DOM.dlcSpellId.textContent = `第 ${spell.id || (SpellbookState.currentIndex + 1)} / ${total} 卷`;
    if (DOM.spellName) DOM.spellName.textContent = `法咒：${spell.spell_name || '無上真言'}`;
    if (DOM.spellPattern) DOM.spellPattern.textContent = `核心靈韻：${spell.pattern || '經典'}`;
    if (DOM.spellChinese) DOM.spellChinese.textContent = spell.chinese || '';
    if (DOM.spellLearningNote) DOM.spellLearningNote.textContent = spell.learning_note || '隨字觀心，唯手熟爾。';

    // 隱藏答對橫幅
    if (DOM.spellFeedbackBanner) DOM.spellFeedbackBanner.style.display = 'none';

    // 經文挖空演算法：挑選 2~4 個關鍵詞做成空白靈槽
    setupSlotsAndWordPool(spell);
  }

  /**
   * 智慧句子拆解與靈槽建置
   */
  function setupSlotsAndWordPool(spell) {
    if (!DOM.spellSentenceBox || !DOM.wordChipsPool) return;

    DOM.spellSentenceBox.innerHTML = '';
    DOM.wordChipsPool.innerHTML = '';

    const words = spell.english.split(' ');
    const candidateKeywords = (spell.keywords2 && spell.keywords2.length > 0)
      ? spell.keywords2
      : (spell.keywords || []);

    const cleanedKeywordsSet = new Set(candidateKeywords.map(k => cleanWord(k)));

    // 決定要挖空的單字索引（取前 3 個匹配關鍵詞，確保手機端好點選、不壅塞）
    const slotIndexes = [];
    words.forEach((w, idx) => {
      const cw = cleanWord(w);
      if (cleanedKeywordsSet.has(cw) && slotIndexes.length < 3) {
        slotIndexes.push(idx);
      }
    });

    // 如果沒有匹配到，隨機挑選 2 個長度大於 3 的單字
    if (slotIndexes.length === 0) {
      words.forEach((w, idx) => {
        if (cleanWord(w).length > 3 && slotIndexes.length < 2) slotIndexes.push(idx);
      });
    }

    SpellbookState.targetSlots = [];
    const correctWords = [];

    // 構建經文顯示區域
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
        
        // 點擊已填入的靈槽，可退回單詞
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

    // 構建散落真言碎片池（正確答案 + 2 個干擾單字）
    const allPoolWords = [...correctWords];
    const candidateDistractors = (spell.keywords || []).map(k => cleanWord(k)).filter(k => !correctWords.includes(k));
    
    // 加入最多 2 個干擾項增加修煉趣味
    candidateDistractors.slice(0, 2).forEach(d => allPoolWords.push(d));

    // Fisher-Yates 洗牌演算法打散單字
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

    // 渲染單字碎片按鈕
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

  /**
   * 點選真言碎片：自動注入第一個空白靈槽
   */
  function handleChipClick(chip) {
    if (chip.isUsed || SpellbookState.isCompleted) return;

    // 尋找第一個未填入的靈槽
    const emptySlot = SpellbookState.targetSlots.find(s => s.userWord === null);
    if (!emptySlot) return;

    // 注入靈槽
    emptySlot.userWord = chip.word;
    emptySlot.chipId = chip.id;
    emptySlot.element.textContent = chip.word;
    emptySlot.element.className = 'spell-slot filled';

    // 標記該字塊已被使用
    chip.isUsed = true;
    chip.element.classList.add('used');

    // 檢查是否全部靈槽皆已注入完成
    checkSlotsCompletion();
  }

  /**
   * 點選靈槽：退回真言碎片至字塊池
   */
  function handleSlotClick(slot) {
    if (!slot.userWord || SpellbookState.isCompleted) return;

    // 恢復字塊狀態
    const chip = SpellbookState.wordPool.find(c => c.id === slot.chipId);
    if (chip) {
      chip.isUsed = false;
      if (chip.element) chip.element.classList.remove('used');
    }

    // 清空靈槽
    slot.userWord = null;
    slot.chipId = null;
    slot.element.textContent = '【 靈槽 】';
    slot.element.className = 'spell-slot empty';

    if (DOM.spellFeedbackBanner) DOM.spellFeedbackBanner.style.display = 'none';
  }

  /**
   * 重置目前題目的所有靈槽
   */
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

  /**
   * 檢查靈槽是否全對並結算修仙道基獎勵
   */
  function checkSlotsCompletion() {
    const allFilled = SpellbookState.targetSlots.every(s => s.userWord !== null);
    if (!allFilled) return;

    // 校驗是否每個靈槽均正確匹配
    const isAllCorrect = SpellbookState.targetSlots.every(s => s.userWord === s.cleanedWord);

    if (isAllCorrect) {
      SpellbookState.isCompleted = true;

      // 標註靈槽為圓滿綠色
      SpellbookState.targetSlots.forEach(s => {
        s.element.className = 'spell-slot correct';
      });

      // 派發道基獎勵：+10 靈氣修為、+2 隨身靈石、+1 法咒掌握
      AppState.currentUser.exp += 10;
      AppState.currentUser.spiritStone += 2;
      AppState.currentUser.wordsLearned += 1;

      // 顯示反饋橫幅
      if (DOM.spellFeedbackBanner && DOM.feedbackText) {
        DOM.feedbackText.textContent = `🎉 法咒圓滿！道心大振，靈氣 +10，隨身靈石 +2！`;
        DOM.spellFeedbackBanner.style.display = 'flex';
      }

      // 檢測境界突破
      checkRealmBreakthrough();
      updateUserUI();

      // 播放真言音韻
      speakSpell(SpellbookState.currentSpell.english);

    } else {
      // 答案有誤，靈槽震動提示
      SpellbookState.targetSlots.forEach(s => {
        if (s.userWord !== s.cleanedWord) {
          s.element.style.borderColor = 'var(--accent-fire)';
          setTimeout(() => {
            if (s.element) s.element.style.borderColor = '';
          }, 600);
        }
      });
      showToast('⚠️ 靈氣運轉有滯，字塊排列尚未圓滿，請點擊靈槽重新調整。');
    }
  }

  /**
   * 透過 Web Speech API 朗讀法咒
   */
  function speakSpell(text) {
    if (!('speechSynthesis' in window)) {
      showToast('目前瀏覽器環境未開啟語音合成法陣。');
      return;
    }
    window.speechSynthesis.cancel(); // 停止先前的朗讀
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // 略為放慢，仙俠沉浸聽感
    window.speechSynthesis.speak(utterance);
  }

  /**
   * 切換中文神諭翻譯顯隱
   */
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

  /**
   * 切換法卷（上一卷、下一卷、隨機悟道）
   */
  function switchSpell(step) {
    if (!SpellbookState.spellsList || SpellbookState.spellsList.length === 0) return;

    if (step === 'random') {
      SpellbookState.currentIndex = Math.floor(Math.random() * SpellbookState.spellsList.length);
    } else {
      SpellbookState.currentIndex += step;
    }
    renderCurrentSpell();
  }

  /* ==========================================================================
     【六、初始化區 (Initialization)】
     ========================================================================== */
  function init() {
    // 1. 立即啟動視窗尺寸適配
    applyScreenAdaptation();
    window.addEventListener('resize', applyScreenAdaptation);
    window.addEventListener('orientationchange', applyScreenAdaptation);

    // 2. 載入外部結構化設定檔
    loadConfigData();

    // 3. 事件監聽綁定
    // (a) 返回洞府按鈕
    if (DOM.btnBackCave) {
      DOM.btnBackCave.addEventListener('click', () => switchScene('scene-cave'));
    }
    // (b) 大地圖中央「小雪修仙秘境」定位點點擊傳送
    if (DOM.mapPinSanctuary) {
      DOM.mapPinSanctuary.addEventListener('click', () => switchScene('scene-cave'));
    }
    // (c) Google 登入按鈕
    if (DOM.btnGoogleLogin) {
      DOM.btnGoogleLogin.addEventListener('click', handleGoogleLogin);
    }
    // (d) 修為彈窗關閉按鈕與點擊背景關閉
    if (DOM.btnCloseStats) {
      DOM.btnCloseStats.addEventListener('click', closeStatsModal);
    }
    if (DOM.modalStats) {
      DOM.modalStats.addEventListener('click', (e) => {
        if (e.target === DOM.modalStats) closeStatsModal();
      });
    }

    // (e) DLC 小雪英咒寶典互動按鈕
    if (DOM.btnBackCaveFromDlc) {
      DOM.btnBackCaveFromDlc.addEventListener('click', () => switchScene('scene-cave'));
    }
    if (DOM.btnResetSlots) {
      DOM.btnResetSlots.addEventListener('click', resetCurrentSlots);
    }
    if (DOM.btnToggleTranslation) {
      DOM.btnToggleTranslation.addEventListener('click', toggleTranslation);
    }
    if (DOM.btnSpellSpeak) {
      DOM.btnSpellSpeak.addEventListener('click', () => {
        if (SpellbookState.currentSpell) speakSpell(SpellbookState.currentSpell.english);
      });
    }
    if (DOM.btnPrevSpell) {
      DOM.btnPrevSpell.addEventListener('click', () => switchSpell(-1));
    }
    if (DOM.btnNextSpell) {
      DOM.btnNextSpell.addEventListener('click', () => switchSpell(1));
    }
    if (DOM.btnRandomSpell) {
      DOM.btnRandomSpell.addEventListener('click', () => switchSpell('random'));
    }
  }

  // DOM 載入完畢即刻初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
