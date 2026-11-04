import {
  getSettings,
  getUser,
  handleAuthCallback,
  logout,
  oauthLogin,
} from "@netlify/identity";

window.XiaoxueNetlifyIdentity = Object.freeze({
  getSettings,
  getUser,
  handleAuthCallback,
  logout,
  oauthLogin,
});
