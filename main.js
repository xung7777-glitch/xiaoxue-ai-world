/**
 * ============================================================================
 * 《小雪 AI 世界》母系統核心邏輯 (main.js)
 * 版本：v2.1.0
 * 職責：
 *   1. 螢幕動態智慧縮放適配引擎（保證手機與電腦端均等比縮放並垂直填滿螢幕）
 *   2. 非同步載入 config.json，動態渲染手機直式卡片流
 *   3. 雙層視覺場景切換（洞府起居室 ⟷ 蠻荒仙府世界大地圖）
 *   4. Google 帳號認證狀態管理與修仙道基數值彈窗
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
    configPath: 'config.json' // 設定檔路徑
  };

  // 全域執行時期狀態
  const AppState = {
    configData: null,
    currentScene: 'scene-cave', // 'scene-cave' 或 'scene-world-map'
    isLoggedIn: false,
    firebaseAuth: null,
    firestore: null,
    googleProvider: null,
    firebaseUser: null,
    currentUser: {
      displayName: '修仙道友',
      realm: '煉氣初期',
      exp: 120,
      expRequired: 300,
      spiritStone: 88,
      beastDefeated: 0,
      wordsLearned: 0
    }
  };

  // DOM 核心節點快取
  const DOM = {
    gameContainer: document.getElementById('game-container'),
    viewportWrapper: document.getElementById('viewport-wrapper'),
    sceneCave: document.getElementById('scene-cave'),
    sceneWorldMap: document.getElementById('scene-world-map'),
    modulesGrid: document.getElementById('modules-grid'),
    btnBackCave: document.getElementById('btn-back-cave'),
    mapPinSanctuary: document.getElementById('map-pin-sanctuary'),
    btnGoogleLogin: document.getElementById('btn-google-login'),
    loginBtnText: document.getElementById('login-btn-text'),
    googleAccountName: document.getElementById('google-account-name'),
    googleAccountEmail: document.getElementById('google-account-email'),
    googleAccountAvatar: document.getElementById('google-account-avatar'),
    userAvatarImg: document.getElementById('user-avatar-img'),
    userProfile: document.getElementById('btn-user-profile'),
    userRealmText: document.getElementById('user-realm-text'),
    modalStats: document.getElementById('modal-stats'),
    btnCloseStats: document.getElementById('btn-close-stats')
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
     【三、資料加載與渲染區 (Data Loading & Rendering)】
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
      // 若因本機 file:// 跨域限制，則啟用備用資料渲染
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
    card.className = `module-card ${mod.id === 'world_map_portal' ? 'portal-card' : ''}`;
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
      { id: "english_spells", title: "英文咒語習得", subtitle: "填空 App", icon: "💬", image: "assets/images/card_english_spells.jpg", type: "learning" },
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
    } else if (mod.id === 'stats_panel' || mod.type === 'modal') {
      // 開啟修為狀態面板彈窗
      openStatsModal();
    } else {
      // 其他 DLC 模組入口提示
      showToast(`已進入【${mod.title}】法陣（子模組將於下階段開放）`);
    }
  }

  /**
   * 平滑場景切換（洞府起居室 ⟷ 世界大地圖）
   */
  function switchScene(sceneName) {
    if (sceneName === 'scene-world-map') {
      DOM.sceneCave.classList.remove('active');
      DOM.sceneCave.classList.add('hidden');
      DOM.sceneWorldMap.classList.remove('hidden');
      DOM.sceneWorldMap.classList.add('active');
      AppState.currentScene = 'scene-world-map';
    } else {
      DOM.sceneWorldMap.classList.remove('active');
      DOM.sceneWorldMap.classList.add('hidden');
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
   * 更新使用者介面數值
   */
  function updateUserUI() {
    if (DOM.userRealmText) {
      DOM.userRealmText.textContent = `當前修為：${AppState.currentUser.realm}`;
    }
    const statRealm = document.getElementById('stat-realm');
    const statExpText = document.getElementById('stat-exp-text');
    const statExpBar = document.getElementById('stat-exp-bar');
    const statStones = document.getElementById('stat-stones');

    if (statRealm) statRealm.textContent = AppState.currentUser.realm;
    if (statExpText) statExpText.textContent = `${AppState.currentUser.exp} / ${AppState.currentUser.expRequired} 靈氣`;
    if (statExpBar) {
      const pct = Math.min(100, Math.round((AppState.currentUser.exp / AppState.currentUser.expRequired) * 100));
      statExpBar.style.width = `${pct}%`;
    }
    if (statStones) statStones.textContent = `${AppState.currentUser.spiritStone} 顆`;
  }

  function renderGoogleAccount(user) {
    AppState.firebaseUser = user || null;
    AppState.isLoggedIn = Boolean(user);

    if (user) {
      if (DOM.btnGoogleLogin) {
        DOM.btnGoogleLogin.disabled = false;
        DOM.btnGoogleLogin.setAttribute('aria-label', 'Google 帳號，點擊確認登出');
        DOM.btnGoogleLogin.title = 'Google 帳號，點擊確認登出';
      }
      if (DOM.userAvatarImg && user.photoURL) DOM.userAvatarImg.src = user.photoURL;
      return;
    }

    if (DOM.btnGoogleLogin) {
      DOM.btnGoogleLogin.disabled = false;
      DOM.btnGoogleLogin.setAttribute('aria-label', 'Google 帳號登入');
      DOM.btnGoogleLogin.title = 'Google 帳號登入';
    }
    if (DOM.userAvatarImg) DOM.userAvatarImg.src = 'assets/images/google-g.svg';
  }

  async function saveGoogleUserProfile(user) {
    const userRef = AppState.firestore.collection('users').doc(user.uid);
    const existingProfile = await userRef.get();
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const profile = {
      uid: user.uid,
      displayName: user.displayName || 'Google 使用者',
      email: user.email || '',
      photoURL: user.photoURL || '',
      providerId: 'google.com',
      lastLoginAt: timestamp
    };

    if (!existingProfile.exists) profile.createdAt = timestamp;
    await userRef.set(profile, { merge: true });
  }

  function getFirebaseLoginErrorMessage(error) {
    const messages = {
      'auth/operation-not-allowed': 'Firebase 尚未啟用 Google 登入方式。',
      'auth/unauthorized-domain': '目前網站網址尚未加入 Firebase 授權網域。',
      'auth/popup-blocked': '瀏覽器封鎖了登入視窗，請允許此網站開啟彈出視窗。',
      'auth/popup-closed-by-user': '登入視窗已關閉，尚未完成登入。',
      'auth/network-request-failed': '網路連線失敗，請檢查網路後再試。'
    };
    return messages[error.code] || `登入失敗：${error.code || error.message}`;
  }

  async function handleGoogleLogin() {
    if (!AppState.firebaseAuth || !AppState.googleProvider || !AppState.firestore) {
      showToast(window.location.protocol === 'file:'
        ? '請用 localhost 或網站網址開啟，file:// 無法讀取 Firebase 設定。'
        : 'Firebase 連線尚未完成，請稍後再試。');
      return;
    }

    if (DOM.btnGoogleLogin) {
      DOM.btnGoogleLogin.disabled = true;
      if (DOM.loginBtnText) DOM.loginBtnText.textContent = '正在連線 Google…';
    }

    let user;
    try {
      await AppState.firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      const result = await AppState.firebaseAuth.signInWithPopup(AppState.googleProvider);
      user = result.user;
    } catch (error) {
      console.error('Firebase Google 登入失敗：', error);
      if (DOM.btnGoogleLogin) DOM.btnGoogleLogin.disabled = false;
      if (DOM.loginBtnText) DOM.loginBtnText.textContent = 'Google 帳號登入';
      showToast(getFirebaseLoginErrorMessage(error));
      return;
    }

    renderGoogleAccount(user);
    try {
      await saveGoogleUserProfile(user);
      showToast('Google 登入成功，帳號資料已儲存至母專案資料庫。');
    } catch (error) {
      console.error('Google 帳號資料寫入 Firestore 失敗：', error);
      showToast('已登入 Google，但帳號資料尚未寫入資料庫。');
    }
  }

  async function handleGoogleLogout() {
    if (!AppState.firebaseAuth) return;
    if (!window.confirm('確定要登出 Google 帳號嗎？')) return;

    try {
      if (DOM.btnGoogleLogin) DOM.btnGoogleLogin.disabled = true;
      await AppState.firebaseAuth.signOut();
      renderGoogleAccount(null);
      showToast('已登出 Google 帳號。');
    } catch (error) {
      if (DOM.btnGoogleLogin) DOM.btnGoogleLogin.disabled = false;
      console.error('Firebase 登出失敗：', error);
      showToast(`登出失敗：${error.code || error.message}`);
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
      background: rgba(14, 25, 40, 0.92);
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
     【五、初始化區 (Initialization)】
     ========================================================================== */
  async function init() {
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
      DOM.btnGoogleLogin.disabled = true;
      DOM.btnGoogleLogin.addEventListener('click', () => {
        if (AppState.firebaseUser) {
          handleGoogleLogout();
        } else {
          handleGoogleLogin();
        }
      });
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

    try {
      const firebaseServices = await window.XiaoxueFirebase.ready;
      AppState.firebaseAuth = firebaseServices.auth;
      AppState.firestore = firebaseServices.db;
      AppState.googleProvider = firebaseServices.googleProvider;

      AppState.firebaseAuth.onAuthStateChanged((user) => {
        renderGoogleAccount(user);
      });
    } catch (error) {
      console.error('Firebase 初始化失敗：', error);
      if (DOM.btnGoogleLogin) DOM.btnGoogleLogin.disabled = false;
      showToast(window.location.protocol === 'file:'
        ? '請透過 localhost 或網站網址開啟，才能連接 Firebase。'
        : 'Firebase 設定載入失敗，請確認 firebase-config.json。');
    }
  }

  // DOM 載入完畢即刻初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
