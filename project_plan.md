# 《小雪 AI 世界》母系統與資料驅動生態系：終極開發企劃書 (v2.1.0)

## 一、 專案核心宗旨與世界觀
本專案旨在打造一個極具東方禪意、溫暖且具備長久生命力的數位心靈避風港與輕量化修仙養成遊戲——《小雪 AI 世界》。
- **核心哲學**：極簡、抒壓、無壓力陪伴。不強迫打卡或解任務，透過自然生態（靈泉、錦鯉、青蛙、蟲鳴）與修行體系（氣海呼吸、八大呼吸法場景），提供一個隨時可放鬆的數位避風港。
- **母子架構 (Mother & DLCs)**：母函數（主畫面框架）負責全局統籌、UI 渲染與雲端同步；子函數（DLCs）各自獨立運作，透過標準 Token 讀寫中央資料庫。
- **資料驅動（Data-Driven）**：所有功能選單、圖片路徑、音樂路徑與 DLC 路由，全部由外部的結構化 `config.json` 統一控制，確保資料不寫死，未來調整僅需改動設定檔。

## 二、 核心雲端與基礎設施 (Cloud & Infrastructure)
為確保個人開發的流暢度與跨模組資料回寫，本專案全面採用 Google / Firebase 生態系：
1. **GitHub 版本控制**：作為源碼與靜態資源的版本管理與備份中樞。
2. **Firebase Firestore Database**：作為整個生態系的「中央帳本」，負責儲存使用者狀態、境界、背包庫存與 DLC 解鎖狀態。
3. **Google 原生登入系統 (Firebase Authentication)**：採用簡單、直接的 Google 登入。使用者登入後自動取得對應的 `UID`，確保所有雲端資料與 Firebase 讀寫均綁定該 Google 帳號。

## 三、 母版本（Mother System）具體設計與 UI/UX 規範【重要更新：手機版單一基準】
為避免多重 Breakpoint 造成的排版破版與維護困難，**本專案全系統唯一以「手機版（直式卡片流）」為設計與開發基準**（舊版之電腦版三欄/九宮格佈局正式廢棄）：
1. **單一核心基準：手機直式卡片佈局（Mobile-First & Mobile-Only View）**：
   - 完全參照 `assets/design/主界面(手機版).jfif` 進行建構。
   - 頂部導航列包含：左側漢堡選單（☰）、中間「小雪的修仙世界」、右側 Google 使用者動態頭像。
   - 頂部 Hero 核心卡片「小雪起居室」：展示小雪打坐冥想立繪、當前修為狀態（如「煉氣初期」）與「Google 帳號登入」互動按鈕。
   - 下方子模組卡片流：包含野外獸區、釣魚河邊、符咒解謎、機關解密、英文咒語習得、靈田煉丹、修為面板與世界地圖換場傳送門。
2. **螢幕動態自適應縮放機制（Dynamic Viewport Auto-Scale & Fit Engine）**：
   - 程式內部必須實作精確的螢幕尺寸適配演算法，根據裝置當前螢幕的寬高比例動態等比縮放整個遊戲介面。
   - **手機端**：100% 填滿直式螢幕，並自動適配不同長寬比之安全區域（Safe Area）。
   - **電腦端 / 平板寬螢幕**：依據螢幕高度動態等比縮放直式主介面（維持 9:16 或直式比例垂直填滿螢幕），自動居中並將可視畫面最大化填滿，兩側自然深色毛玻璃過渡，呈現極致流暢的手遊模擬器質感，杜絕任何變形與錯位。
3. **視覺雙層架構與場景傳送**：
   - **主介面（洞府日常）**：深色修仙美學，卡片式呈現各模組入口。
   - **外出地圖模式**：點擊右下角「世界地圖換場傳送門」，平滑切換至全螢幕《世界地圖》（參考 `assets/design/世界地圖.jfif`）；在地圖中點擊中央「小雪的修仙秘境（洞府核心）」即可傳送回主介面。

## 四、 專屬資料庫與資料結構設計 (Firestore 結構)
採用扁平化設計。每個登入的 Google 用戶在 Firestore 的 `users` 集合中對應一個以 `google_user_uid` 命名的 Document：

```json
{
  "uid": "google_auth_unique_id",
  "displayName": "玩家暱稱",
  "email": "user@gmail.com",
  "photoURL": "google_avatar_url",
  "lastLogin": "2026-11-02T12:00:00Z",
  "realm": "煉氣初期",
  "level": 1,
  "exp": 100,
  "expRequired": 300,
  "spiritStone": 50,
  "stats": {
    "beastDefeated": 0,
    "wordsLearned": 0,
    "alchemyGrade": 1
  },
  "unlockedDlcs": ["dlc_spirit_spring", "dlc_spellbook"]
}
```

## 五、 專案資料夾結構與靜態資產規範
所有程式碼、圖片與音樂統一存放在專屬目錄中，結構嚴格規範如下：

```text
/xiaoxue-xianxia-game
  ├── package.json
  ├── index.html                   <--- 母函數主畫面 (9:16 模擬器架構)
  ├── style.css                    <--- 全局樣式檔 (含毛玻璃與響應式置中)
  ├── main.js                      <--- 母函數核心邏輯 (Firebase 登入與資料綁定)
  ├── config.json                  <--- 統籌所有 DLC、圖片與音樂路徑的總設定檔
  │
  ├── /assets                      <--- 【統一資源庫】
  │     ├── /images                <--- 圖片專區
  │     │     ├── background_map.jpg  <--- 9:16 規格世界大地圖
  │     │     └── [其他共用圖]
  │     │
  │     └── /audio                 <--- 音樂與音效專區
  │           ├── cave_bgm.mp3        <--- 洞府背景音樂
  │           └── [其他共用音效]
  │
  └── /dlcs                        <--- 【子函數/DLC 獨立房間】
        ├── /dlc_spirit_spring     <--- 靈泉庭院 DLC (錦鯉、青蛙、蟋蟀)
        │     ├── index.html
        │     └── script.js
        └── /dlc_spellbook         <--- 英文學習 DLC (Spellbook)
              ├── index.html
              └── script.js
```

## 六、 結構化設定檔管理 (`config.json` 規範)
未來若要新增 DLC、更換圖片或調整參數，直接修改此 JSON 檔即可，嚴禁寫死在程式碼中。手機版主介面各功能卡片清單亦由 `config.json` 動態加載：

```json
{
  "version": "v2.1.0",
  "lastUpdated": "2026-11-02",
  "system_info": {
    "project_name": "小雪的修仙世界",
    "auth_provider": "Google",
    "firebase_connected": true
  },
  "modules": [
    { "id": "beast_zone", "title": "野外獸區", "subtitle": "倖存者打怪入口", "icon": "fire", "type": "game" },
    { "id": "fishing_river", "title": "釣魚河邊", "subtitle": "休閒垂釣入口", "icon": "water", "type": "relax" },
    { "id": "talisman_puzzle", "title": "符咒解謎", "subtitle": "2048 變體玩法", "icon": "talisman", "type": "puzzle" },
    { "id": "gear_puzzle", "title": "機關解密", "subtitle": "俄羅斯方塊變體", "icon": "gear", "type": "puzzle" },
    { "id": "english_spells", "title": "英文咒語習得", "subtitle": "填空 App", "icon": "chat", "type": "learning" },
    { "id": "herb_alchemy", "title": "靈田 煉丹房", "subtitle": "草藥培養與丹道", "icon": "sprout", "type": "cultivation" },
    { "id": "stats_panel", "title": "修為 / 狀態", "subtitle": "完整修為狀態面板", "icon": "chart", "type": "stats" },
    { "id": "world_map_portal", "title": "世界地圖換場傳送門", "subtitle": "探索蠻荒大世界", "icon": "portal", "type": "portal" }
  ],
  "dlcList": [
    {
      "id": "dlc_spirit_spring",
      "name": "靈泉庭院",
      "type": "ecosystem",
      "imageUrl": "/assets/images/scene_spring.jpg",
      "audioUrl": "/assets/audio/gentle_stream.mp3",
      "targetUrl": "/dlcs/dlc_spirit_spring/index.html"
    },
    {
      "id": "dlc_spellbook",
      "name": "英文心法（Spellbook）",
      "type": "learning",
      "imageUrl": "/assets/images/scene_spellbook.jpg",
      "audioUrl": "/assets/audio/study_bgm.mp3",
      "targetUrl": "/dlcs/dlc_spellbook/index.html"
    }
  ],
  "sanctuary_spirit_spring": {
    "environment_sound": {
      "cricket_active": true,
      "cricket_volume": 0.4
    },
    "koi_config": {
      "total_count": 3,
      "swim_speed": 1.2
    },
    "frog_config": {
      "active": true,
      "jump_min_interval_sec": 30,
      "jump_max_interval_sec": 60
    }
  }
}
```

## 七、 開發鐵律與協作規範 (Developer & AI Guidelines)
Antigravity 在編寫本專案之程式碼時，必須嚴格遵守以下四項最高指導原則：
1. **順應 AI 專長，保持代碼穩定**：使用最熟悉、效能最高、最穩定的標準 JavaScript 語法，確保網頁流暢、零 Bug。
2. **強制全中文註解與結構分明**：所有程式碼必須包含詳細的繁體中文註解，並明確劃分出「設定區」、「邏輯動作區」與「初始化區」。
3. **資料絕對不寫死（Config-Driven）**：任何數值、計時秒數、音量、路徑等絕對禁止寫死，一律由根目錄 `config.json` 讀取。
4. **完整的設定檔說明書**：專案必須附帶清楚的說明文件，解釋設定檔中各變數之意義與控制範圍。