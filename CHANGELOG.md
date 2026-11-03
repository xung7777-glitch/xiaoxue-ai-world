# 變更記錄

## 2026-11-03 — 母專案 Firebase Google 登入

- 加入 Firebase Web 設定與共用連線程式，母專案使用 Firebase Authentication 和 `(default)` Firestore。
- Google 登入成功後，以 `/users/{uid}` 儲存或更新帳號 UID、顯示名稱、電子郵件、頭像網址和登入時間。
- 登入與登出改由同一顆按鈕依狀態切換。登入後顯示 Google 帳號名稱、電子郵件與頭像；點擊後會先確認再登出。
- 右上角未登入時顯示 Google 圖示，登入後顯示 Google 帳號頭像。
- 加入 Firestore 規則：使用者只能讀寫自己的 `/users/{uid}` 文件；未來 DLC 資料可放在該使用者文件下的 `dlcs` 子集合。
- 加入 `firebase.json`、`.firebaserc`、`firebase-config.json`、`firebase-connection.js`、`firestore.rules` 和 Google 圖示資源。
- Firebase Console 中的 Google 登入提供者及支援信箱由使用者手動啟用；此 Console 狀態不會由 Git 記錄。
- 本機測試需透過 HTTP 開啟，例如 `py -m http.server 8000 --bind localhost`，再瀏覽 `http://localhost:8000/index.html`；直接以 `file://` 開啟無法載入 Firebase 設定。

### 工作區原有的母程式／DLC 分離變更

- 從母程式移除 Spellbook 的內嵌場景、控制邏輯、樣式及主畫面連結；獨立的 `dlcs/dlc_spellbook/` 專案原始碼未修改。
- `dlcs/data_bundle.js`、`implementation_plan.md`、`task.md` 在本次備份前已處於刪除狀態；本次記錄並納入目前工作區版本。

### 掃描紀錄

- `main.js` 語法檢查通過；`config.json`、`firebase-config.json`、`.firebaserc`、`firebase.json` 均可解析。
- `git diff --check` 通過，並檢查了 Firebase 設定、Firestore 規則、主程式登入狀態切換及刪除項目的引用。
- 使用者已確認登入介面目前可以運作；本次未執行自動化測試。
