import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(projectRoot, "dist");

const appFiles = [
  "index.html",
  "style.css",
  "main.js",
  "config.json",
  "firebase-config.json",
  "firebase-connection.js",
];

const appAssets = [
  "assets/images/google-g.svg",
  "assets/images/hero_meditation.jpg",
  "assets/images/card_beast_zone.jpg",
  "assets/images/card_fishing_river.jpg",
  "assets/images/card_talisman_puzzle.jpg",
  "assets/images/card_gear_puzzle.jpg",
  "assets/images/card_english_spells.jpg",
  "assets/images/card_herb_alchemy.jpg",
  "assets/images/card_stats_panel.jpg",
  "assets/images/card_portal.jpg",
  "assets/design/世界地圖.jfif",
  "assets/design/世界地圖(含小雪所在位置).jfif",
  "assets/audio/homepage-music.mp3",
];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const relativePath of [...appFiles, ...appAssets]) {
  const source = join(projectRoot, relativePath);
  const destination = join(outputRoot, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination);
}

console.log(`Prepared ${appFiles.length + appAssets.length} files for Netlify in dist/.`);
