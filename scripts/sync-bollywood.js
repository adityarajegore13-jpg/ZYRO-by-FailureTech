/**
 * ZYRO by FailureTech — Bollywood Media Installer & Library Generator
 * Safely copies local Bollywood audio and video files into public/bollywood-media
 * and generates a strongly-typed TypeScript library & manifest.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(projectRoot, 'bollywood song');
const destRoot = path.join(projectRoot, 'public', 'bollywood-media');

if (!fs.existsSync(sourceRoot)) {
  console.error('[Error] Source folder does not exist:', sourceRoot);
  process.exit(1);
}

// Ensure destination root exists
if (!fs.existsSync(destRoot)) {
  fs.mkdirSync(destRoot, { recursive: true });
}

function cleanTitle(filename) {
  let name = filename.replace(/\.(mp3|mp4|wav|m4a|webm)$/i, '');
  // Remove track numbers like '01. '
  name = name.replace(/^\d+[\.\s\-]+/, '');
  // Clean common tags
  name = name.replace(/\(Official (Video|Audio|Music Video)\)/gi, '');
  name = name.replace(/\[Official (Video|Audio|Music Video)\]/gi, '');
  name = name.replace(/FULL VIDEO Song/gi, '');
  name = name.replace(/Lyrical Video Song/gi, '');
  name = name.replace(/Lyrical Video/gi, '');
  name = name.replace(/Lyric Video/gi, '');
  name = name.replace(/Lyrcial/gi, '');
  name = name.replace(/Full Song/gi, '');
  name = name.replace(/\(HD\)/gi, '');
  name = name.replace(/Video Song/gi, '');
  name = name.replace(/\(Video\)/gi, '');
  name = name.replace(/\(Live[^\)]*\)/gi, '');
  name = name.replace(/T-Series/gi, '');
  name = name.replace(/Coke Studio Bharat/gi, '');
  name = name.replace(/Latest Hindi Song \d+/gi, '');
  name = name.replace(/Prod\.?\s*by\s*[\w\s]+/gi, '');
  name = name.replace(/l\s*PROD\.?\s*BY\s*[\w\s]+/gi, '');
  name = name.replace(/Official Visualizer/gi, '');
  name = name.replace(/Official/gi, '');
  return name.replace(/\s+/g, ' ').trim();
}

function parseSongMetadata(filename, folderCategory) {
  const ext = path.extname(filename).toLowerCase();
  const isVideo = ext === '.mp4' || ext === '.webm';
  const cleaned = cleanTitle(filename);

  let title = cleaned;
  let artist = 'Various Artists';
  let album = 'Bollywood Vault';
  let category = 'Bollywood';
  let genre = 'Bollywood';

  if (folderCategory === 'Sambata') {
    category = 'Marathi';
    genre = 'Desi Hip-Hop / Marathi';
    artist = 'Sambata';
    album = 'Sambata Hip-Hop';
    title = cleaned.replace(/^l\s*/, '').trim();
  } else if (folderCategory === 'Moosetape') {
    category = 'Punjabi';
    genre = 'Punjabi Hip-Hop';
    artist = 'Sidhu Moose Wala';
    album = 'Moosetape';
  } else if (folderCategory === 'Singles') {
    category = 'Singles';
    genre = 'Desi Pop / Hip-Hop';
    artist = 'Yo Yo Honey Singh';
    album = 'Honey Singh Singles';
    if (/Hommie/i.test(cleaned)) artist = 'Hommie Dilliwala';
  } else if (folderCategory === 'Paresh-Pahuja') {
    category = 'Bollywood';
    genre = 'Acoustic Soul';
    artist = 'Paresh Pahuja';
    album = 'Voice Notes Sessions';
  }

  // Exact known titles for root files
  if (/Tu Chahiye/i.test(cleaned)) {
    title = 'Tu Chahiye';
    artist = 'Atif Aslam, Pritam';
    album = 'Bajrangi Bhaijaan';
  } else if (/HUSN/i.test(cleaned)) {
    title = 'HUSN';
    artist = 'Anuv Jain';
    album = 'HUSN Single';
  } else if (/Arz Kiya Hai/i.test(cleaned)) {
    title = 'Arz Kiya Hai';
    artist = 'Anuv Jain, Lost Stories';
    album = 'Coke Studio';
  } else if (/Pehli Dafa/i.test(cleaned)) {
    title = 'Pehli Dafa';
    artist = 'Atif Aslam';
    album = 'Pehli Dafa Single';
  } else if (/Hona Tha Pyar/i.test(cleaned)) {
    title = 'Hona Tha Pyar';
    artist = 'Atif Aslam, Hadiqa Kiani';
    album = 'Bol';
  } else if (/Banjaare/i.test(cleaned)) {
    title = 'Banjaare';
    artist = 'Barsaat';
    album = 'Indie Folk';
  } else if (/Bin Tere/i.test(cleaned)) {
    title = 'Bin Tere';
    artist = 'Shekhar Ravjiani, Vishal & Shekhar';
    album = 'I Hate Luv Storys';
  } else if (/Bulleya/i.test(cleaned)) {
    title = 'Bulleya';
    artist = 'Papon, Vishal & Shekhar';
    album = 'Sultan';
  } else if (/Doorie/i.test(cleaned)) {
    title = 'Doorie';
    artist = 'Atif Aslam';
    album = 'Doorie';
  } else if (/Dooriyan/i.test(cleaned)) {
    title = 'Dooriyan';
    artist = 'Mohit Chauhan, Pritam';
    album = 'Love Aaj Kal';
  } else if (/Dooron Dooron/i.test(cleaned)) {
    title = 'Dooron Dooron';
    artist = 'Paresh Pahuja, Harleen Sethi';
    album = 'Single';
  } else if (/Iktara/i.test(cleaned)) {
    title = 'Iktara';
    artist = 'Kavita Seth, Amit Trivedi';
    album = 'Wake Up Sid';
  } else if (/In Dino/i.test(cleaned)) {
    title = 'In Dino';
    artist = 'Soham Chakrabarty, Pritam';
    album = 'Life in a Metro';
  } else if (/Kabira/i.test(cleaned)) {
    title = 'Kabira';
    artist = 'Pritam, Tochi Raina, Rekha Bhardwaj';
    album = 'Yeh Jawaani Hai Deewani';
  } else if (/Meri Kahani/i.test(cleaned)) {
    title = 'Meri Kahani';
    artist = 'Atif Aslam';
    album = 'Meri Kahani';
  } else if (/Khat/i.test(cleaned)) {
    title = 'Khat';
    artist = 'Navjot Ahuja';
    album = 'Indie Single';
  } else if (/Tum Ho/i.test(cleaned)) {
    title = 'Tum Ho';
    artist = 'A.R. Rahman, Mohit Chauhan';
    album = 'Rockstar';
  } else if (/Tera Mera Rishta/i.test(cleaned)) {
    title = 'Tera Mera Rishta Purana';
    artist = 'Mustafa Zahid';
    album = 'Awarapan';
  } else if (/Tere Bin/i.test(cleaned)) {
    title = 'Tere Bin';
    artist = 'Atif Aslam';
    album = 'Bas Ek Pal';
  } else if (/Choo Lo/i.test(cleaned)) {
    title = 'Choo Lo';
    artist = 'The Local Train';
    album = 'Aalas Ka Pedh';
  } else if (/Aaoge Tum Kabhi/i.test(cleaned)) {
    title = 'Aaoge Tum Kabhi';
    artist = 'The Local Train';
    album = 'Aalas Ka Pedh';
  } else if (/Tu Jaane Na/i.test(cleaned)) {
    title = 'Tu Jaane Na';
    artist = 'Atif Aslam, Pritam';
    album = 'Ajab Prem Ki Ghazab Kahani';
  } else if (/Tum Se Hi/i.test(cleaned)) {
    title = 'Tum Se Hi';
    artist = 'Mohit Chauhan, Pritam';
    album = 'Jab We Met';
  } else if (/Vaaroon/i.test(cleaned)) {
    title = 'Vaaroon';
    artist = 'Romy, Anand Bhaskar';
    album = 'Mirzapur';
  } else if (/Loca/i.test(cleaned)) {
    title = 'Loca';
    artist = 'Yo Yo Honey Singh';
    album = 'Loca Single';
  }

  // Artwork mapping based on category/album
  let artworkUrl = '/assets/bollywood/tum-hi-ho.jpg';
  if (/Kabira/i.test(title)) artworkUrl = '/assets/bollywood/kabira.jpg';
  else if (/Dil Se/i.test(title)) artworkUrl = '/assets/bollywood/dil-se-re.jpg';
  else if (/Tum Se Hi|Jab We Met/i.test(title)) artworkUrl = '/assets/bollywood/tum-hi-ho.jpg';
  else if (category === 'Marathi') artworkUrl = '/assets/marathi-zingaat.jpg';
  else if (category === 'Punjabi') artworkUrl = '/assets/chromapulse.jpg';
  else if (category === 'Singles') artworkUrl = '/assets/workout-phonk.jpg';
  else if (isVideo) artworkUrl = '/assets/bollywood/chaiyya-chaiyya.jpg';

  return {
    title: title || cleaned,
    artist,
    album,
    category,
    genre,
    artworkUrl,
    isVideo
  };
}

// 1. Gather all unique files to copy
const groups = [
  { folderName: '.', targetSubdir: 'Bollywood', category: 'Bollywood' },
  { folderName: 'Moosetape  Sidhu Moose Wala', targetSubdir: 'Moosetape', category: 'Moosetape' },
  { folderName: 'Mix - Sambata', targetSubdir: 'Sambata', category: 'Sambata' },
  { folderName: 'Singles', targetSubdir: 'Singles', category: 'Singles' },
  { folderName: 'Mix - Paresh Pahuja - Dooron Dooron (Live from The Voice Notes Concert)', targetSubdir: 'Paresh-Pahuja', category: 'Paresh-Pahuja' }
  // Notice: 'Mix - Meri Kahani...' is intentionally skipped because it contains exact duplicates of '.'
];

let totalCopied = 0;
let totalSkipped = 0;
const manifest = [];

for (const group of groups) {
  const dirPath = path.join(sourceRoot, group.folderName);
  if (!fs.existsSync(dirPath)) {
    console.warn('[Warning] Directory does not exist:', dirPath);
    continue;
  }

  const targetDir = path.join(destRoot, group.targetSubdir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(dirPath);
  for (const filename of files) {
    const srcFilePath = path.join(dirPath, filename);
    const stat = fs.statSync(srcFilePath);
    if (!stat.isFile()) continue;

    const ext = path.extname(filename).toLowerCase();
    if (!['.mp3', '.mp4', '.wav', '.m4a', '.webm'].includes(ext)) {
      continue;
    }

    const destFilePath = path.join(targetDir, filename);

    // Only copy if file doesn't exist or size differs
    if (!fs.existsSync(destFilePath) || fs.statSync(destFilePath).size !== stat.size) {
      fs.copyFileSync(srcFilePath, destFilePath);
      totalCopied++;
    } else {
      totalSkipped++;
    }

    const meta = parseSongMetadata(filename, group.category);
    // Encode URL for safe web serving
    const encodedFilename = encodeURIComponent(filename);
    const servedUrl = `/bollywood-media/${group.targetSubdir}/${encodedFilename}`;
    const id = `local-bolly-${group.targetSubdir.toLowerCase()}-${manifest.length + 1}`;

    manifest.push({
      id,
      title: meta.title,
      artist: meta.artist,
      movieOrAlbum: meta.album,
      category: meta.category,
      genre: meta.genre,
      src: servedUrl,
      artworkUrl: meta.artworkUrl,
      duration: meta.isVideo ? 270 : 210, // Default duration, updated by browser onLoadedMetadata
      isVideo: meta.isVideo,
      mediaType: meta.isVideo ? 'video' : 'audio',
      fileFormat: ext.replace('.', '').toUpperCase(),
      originalFilename: filename,
      crate: group.targetSubdir,
      fileSize: stat.size,
      key: meta.isVideo ? 'HD VIDEO' : '320K MP3',
      bitrate: meta.isVideo ? 'AAC 320K / 1080P' : '320 KBPS LOSSLESS',
      bpm: 110
    });
  }
}

console.log(`[Install Complete] Copied: ${totalCopied}, Up-to-date/Skipped: ${totalSkipped}, Total in Library: ${manifest.length}`);

// Write JSON manifest
const manifestPath = path.join(projectRoot, 'lib', 'audio', 'bollywoodManifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log('[Manifest Written]', manifestPath);

// Write TypeScript library module
const tsContent = `/**
 * ZYRO by FailureTech — Master Local Bollywood & Desi Library
 * Automatically generated manifest of all 110 local Bollywood audio and video files.
 */

import { Track } from './catalog';

export interface LocalMediaTrack extends Track {
  isVideo?: boolean;
  mediaType?: 'audio' | 'video';
  fileFormat?: string;
  originalFilename?: string;
  crate?: string;
  fileSize?: number;
}

export const LOCAL_BOLLYWOOD_TRACKS: LocalMediaTrack[] = ${JSON.stringify(manifest, null, 2)};

export const LOCAL_AUDIO_TRACKS = LOCAL_BOLLYWOOD_TRACKS.filter(t => !t.isVideo);
export const LOCAL_VIDEO_TRACKS = LOCAL_BOLLYWOOD_TRACKS.filter(t => t.isVideo);
`;

const tsPath = path.join(projectRoot, 'lib', 'audio', 'bollywoodLibrary.ts');
fs.writeFileSync(tsPath, tsContent, 'utf-8');
console.log('[TypeScript Library Written]', tsPath);
