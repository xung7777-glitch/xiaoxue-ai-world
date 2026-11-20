# 《小雪 AI 世界》DLC 擴充與 GitHub 專案無縫接入指南 (v2.1.0)

本指南旨在解答使用者對於「母系統與外部 DLC 專案如何無縫對接」的技術規範與操作步驟。

---

## 一、 核心疑問解答：外部專案的 `index.html` 需要換名字嗎？

> **結論：完全不需要換名字！直接保持 `index.html` 是 Web 標準中最完美、最正確的做法！**

### 為什麼不需要改名？
在現代 Web 與瀏覽器標準中，**任何子資料夾的預設首頁本來就是 `index.html`**。
例如：
- 當您把外部 GitHub 專案整個放入 `/dlcs/dlc_spellbook/` 資料夾時；
- 瀏覽器載入 `/dlcs/dlc_spellbook/`，會**自動且唯一的載入該目錄下的 `index.html`**；
- 每個 DLC 擁有自己獨立的資料夾（如 `dlc_spellbook`、`dlc_spirit_spring`），彼此完全隔離，因此彼此的 `index.html` 絕不會撞名或衝突！

---

## 二、 專案資料夾結構規範 (DLCs Directory)

所有自 GitHub 導入或未來新開發的獨立小程式，一律統一存放於 `/public/dlcs/` 專區：

```text
/public
  ├── config.json                        <--- 母系統總控設定檔
  └── /dlcs                              <--- 【DLC 獨立模組集中區】
        │
        ├── /dlc_spellbook               <--- 您的英文咒語專案 (直接放這裡)
        │     ├── index.html             <--- 保持原名，直接執行
        │     ├── style.css              <--- 該專案自有的樣式檔
        │     └── script.js              <--- 該專案自有的邏輯檔
        │
        ├── /dlc_spirit_spring           <--- 靈泉庭院 DLC (錦鯉、青蛙與自然生態)
        │     └── index.html
        │
        └── /dlc_your_new_game           <--- 未來新增的任何 GitHub 專案
              └── index.html
```

---

## 三、 極簡通訊橋樑 (PostMessage 雙向協定)

為了讓外部專案（例如英文學習 App）能與《小雪 AI 世界》的修仙母系統連動，您只需在外部專案的 JavaScript 中，於「答對單字」或「通關」時加上以下通訊代碼：

### 1. 向母系統派發靈氣與靈石獎勵：
```javascript
// 當玩家答對單字、解開謎題或完成修煉時調用：
window.parent.postMessage({
  type: "XIAOXUE_DLC_EVENT",
  action: "REWARD",
  payload: {
    exp: 40,               // 獎勵修為靈氣數值
    spiritStones: 20,      // 獎勵靈石數值
    message: "成功掌握上古真言【SHIELD】！"
  }
}, "*");
```

### 2. 玩家點擊「返回洞府」時關閉 DLC：
```javascript
// 點擊返回按鈕時調用：
window.parent.postMessage({
  type: "XIAOXUE_DLC_EVENT",
  action: "CLOSE"
}, "*");
```

---

## 四、 資料驅動設定 (`config.json`)

未來只要有新的 DLC 要上線，在根目錄 `config.json` 的 `modules` 或 `dlcList` 新增一筆設定即可，**完全不用修改母系統的 React 程式碼**：

```json
{
  "id": "english_spells",
  "title": "英文咒語習得",
  "subtitle": "填空 App",
  "icon": "💬",
  "type": "learning",
  "targetUrl": "/dlcs/dlc_spellbook/index.html",
  "useExternalDlc": true
}
```

* 當 `useExternalDlc: true` 時，母系統會直接以 **9:16 手遊沙盒** 載入 `/dlcs/dlc_spellbook/index.html`。
* 當 `useExternalDlc: false` 時，母系統會使用原先內建的 React 原型組件作為備用。

---

## 五、 GitHub 匯入 SOP (標準作業流程)

當您把 GitHub 專案準備好時，您只需：
1. 將 GitHub 倉庫連結分享出來，或把該專案整包發給我；
2. 我會直接將其建立到 `/public/dlcs/對應名稱/` 目錄下（保持 `index.html` 不變）；
3. 幫您確認 `postMessage` 回傳點已串接好；
4. 母系統就能瞬間無縫啟動！
