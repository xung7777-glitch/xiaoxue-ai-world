import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Music, LogIn, LogOut, X, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/audio';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, loginWithGoogle, logout, isLoading } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Pure Authentication Trigger (Login if logged out, Logout confirmation if logged in)
  const handleAuthActionClick = async () => {
    sounds.playChime(523.25, 0.4);
    if (!user) {
      try {
        await loginWithGoogle();
      } catch (err) {
        console.error('Google login failed:', err);
      }
    } else {
      // User is logged in: show logout confirmation dialog
      setShowLogoutConfirm(true);
    }
  };

  const handleConfirmLogout = async () => {
    sounds.playChime(440, 0.3);
    setShowLogoutConfirm(false);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <div className="w-full flex items-center justify-end px-3 py-2.5 transition-all">
        {/* Right side: Google Login/Logout Action Button */}
        <div className="flex items-center gap-2">
          {/* Pure Login / Logout Action Button */}
          <button
            onClick={handleAuthActionClick}
            disabled={isLoading}
            title={
              user
                ? `點擊登出 Google 帳號 (${user.displayName || user.email})`
                : '點擊以 Google 帳號登入修仙世界'
            }
            className="w-10 h-10 rounded-full bg-white p-0.5 shadow-[0_0_12px_rgba(59,130,246,0.35)] hover:shadow-[0_0_16px_rgba(34,211,238,0.6)] transition-all active:scale-95 flex items-center justify-center relative overflow-hidden group cursor-pointer"
          >
            {user && user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google User'}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <svg viewBox="0 0 48 48" className="w-7 h-7">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.79l7.98-6.2z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}

            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#0a0f1c] ${
                user ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xs bg-gradient-to-b from-[#131d31] via-[#0e1627] to-[#090f1b] border border-cyan-500/50 rounded-2xl p-5 shadow-[0_0_40px_rgba(6,182,212,0.3)] text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Header Icon */}
            <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-400/60 mx-auto flex items-center justify-center text-xl shadow-inner">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" />
              ) : (
                '🚪'
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-serif">登出 Google 帳號確認</h3>
              <p className="text-xs text-cyan-300 font-medium mt-1">
                {user?.displayName || user?.email || '當前修仙道友'}
              </p>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                確定要登出 Google 帳號嗎？登出後進度將暫停雲端同步，並切換回訪客散修模式。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all active:scale-95"
              >
                取消返回
              </button>
              <button
                onClick={handleConfirmLogout}
                className="py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-md shadow-rose-950/50 transition-all active:scale-95"
              >
                確定登出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
