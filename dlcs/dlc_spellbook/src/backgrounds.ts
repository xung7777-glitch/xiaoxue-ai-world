
export const BackgroundImages = {
  BASE_URL: 'https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/',
  
  DEFAULT: 'bg_english.jfif',
  
  // 咒譜 (Patterns)
  PATTERNS: 'bg_english10.jfif',
  
  // 試煉 (Trial / Scenarios)
  TRIALS: 'bg_english6.jfif',
  
  // 道典 (Practice Center / About)
  // User says: 道典 (Practice/About): bg_english13.jfif
  PRACTICE: 'bg_english13.jfif',
  PRACTICE_HUB: 'bg_english13.jfif',
  ABOUT: 'bg_english13.jfif',
  
  // 天律 (Privacy / Insights)
  // User says: 天律是這個圖 bg_english7
  PRIVACY: 'bg_english7.jfif',
  INSIGHTS: 'bg_english7.jfif',
  
  // 我的最愛 (Favorites)
  // User says: 我的最愛是這個圖 bg_english3
  FAVORITES: 'bg_english3.jfif',
  
  // 封神殘卷 (Wrong List)
  // User says: 封神殘卷是這個圖 bg_english4
  WRONG_LIST: 'bg_english4.jfif',
  
  // Others
  GUIDE: 'bg_english9.jfif',
  RANK: 'bg_english2.jfif',
};

export const getBackgroundUrl = (imageName: string) => {
  return `${BackgroundImages.BASE_URL}${imageName}`;
};
