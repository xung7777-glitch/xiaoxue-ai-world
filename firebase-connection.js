/*
 * Shared Firebase connection for the mother app and future DLCs.
 * A DLC can load this file and await window.XiaoxueFirebase.ready to use
 * the same Firebase Auth instance and the mother's default Firestore database.
 */
(function (window) {
  'use strict';

  const scriptUrl = document.currentScript && document.currentScript.src;
  const configUrl = scriptUrl
    ? new URL('firebase-config.json', scriptUrl).toString()
    : 'firebase-config.json';

  const ready = (async function () {
    if (!window.firebase) {
      throw new Error('Firebase SDK 尚未載入。');
    }

    const response = await fetch(configUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Firebase 設定讀取失敗 (${response.status})。`);
    }

    const config = await response.json();
    const app = window.firebase.apps.length
      ? window.firebase.app()
      : window.firebase.initializeApp(config);

    return Object.freeze({
      app,
      auth: window.firebase.auth(app),
      db: window.firebase.firestore(app),
      googleProvider: new window.firebase.auth.GoogleAuthProvider(),
      config
    });
  })();

  window.XiaoxueFirebase = Object.freeze({ ready });
})(window);
