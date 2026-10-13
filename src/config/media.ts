// Centralized media configuration with base path awareness for GitHub Pages & static hosting
const BASE = import.meta.env?.BASE_URL || './';
const cleanBase = BASE.endsWith('/') ? BASE : `${BASE}/`;

export const MEDIA_CONFIG = {
  // OFK Company Logo
  logo: `${cleanBase}images/ofk-logo.webp`,
  
  // Track Cover with Vitaly Gennadievich as TVG King of Trap
  directorCover: `${cleanBase}images/director-cover.jpg`,
  
  // Director portrait photo used in game avatar & badges
  directorPhoto: `${cleanBase}images/director-photo.jpg`,
  
  // Team greeting video
  teamVideo: `${cleanBase}video/team-greeting.mp4`,
  
  // Original TVG rap song
  birthdaySong: `${cleanBase}audio/birthday-song.mp3`,
  
  // Raw lyrics text file
  lyricsText: `${cleanBase}audio/lyrics.txt`,
};
