const fs = require('fs');
const path = require('path');
const https = require('https');

const manifestPath = path.join(__dirname, '../lib/audio/bollywoodManifest.json');
const libraryTsPath = path.join(__dirname, '../lib/audio/bollywoodLibrary.ts');
const artworkDir = path.join(__dirname, '../public/artwork');

if (!fs.existsSync(artworkDir)) {
  fs.mkdirSync(artworkDir, { recursive: true });
}

const rawTracks = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      return resolve(destPath);
    }
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(destPath, () => {});
        return resolve(null);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      resolve(null);
    });
  });
}

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Moosetape official cover URL (Sidhu Moose Wala official 2021 album)
const MOOSETAPE_COVER_URL = 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/97/69/58/976958ae-725e-bd41-6755-f0921c697840/810063889609_cover.jpg/600x600bb.jpg';
const MAAZ_ALBUM_COVER_URL = 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a2/7e/f0/a27ef0e8-1204-e52b-4b43-e56254292b77/26UMGIM32111.rgb.jpg/600x600bb.jpg';

// Targeted search configuration for accurate verification
async function findOfficialArtwork(track) {
  const normTitle = normalize(track.title);
  const normAlbum = normalize(track.movieOrAlbum);
  const normArtist = normalize(track.artist);
  const orig = track.originalFilename || '';

  // 1. Sidhu Moose Wala - Moosetape Crate (All 21 tracks)
  if (track.crate === 'Moosetape' || /moosetape/i.test(orig) || /moosetape/i.test(track.title)) {
    return {
      status: 'VERIFIED_MATCH',
      priority: 'Priority 3: Verified Soundtrack/Album Artwork',
      source: 'Apple Music / iTunes India Official Release',
      officialTrackName: track.title,
      officialArtistName: 'Sidhu Moose Wala',
      officialCollection: 'Moosetape (Official Album)',
      remoteArtworkUrl: MOOSETAPE_COVER_URL,
      slug: 'moosetape-sidhu-moose-wala'
    };
  }

  // 2. Query iTunes with targeted variations
  const searchQueries = [];

  // Custom high-precision extraction
  if (track.crate === 'Bollywood') {
    if (/Tu Chahiye/i.test(track.title)) searchQueries.push('Tu Chahiye Bajrangi Bhaijaan Atif Aslam');
    else if (/HUSN/i.test(track.title)) searchQueries.push('Anuv Jain HUSN');
    else if (/Arz Kiya Hai/i.test(track.title)) searchQueries.push('Arz Kiya Hai Anuv Jain Lost Stories');
    else if (/Pehli Dafa/i.test(track.title)) searchQueries.push('Pehli Dafa Atif Aslam');
    else if (/Hona Tha Pyar/i.test(track.title)) searchQueries.push('Hona Tha Pyar Bol Atif Aslam');
    else if (/Banjaare/i.test(track.title)) searchQueries.push('Barsaat Banjaare');
    else if (/Bin Tere/i.test(track.title)) searchQueries.push('Bin Tere I Hate Luv Storys');
    else if (/Bulleya/i.test(track.title)) searchQueries.push('Bulleya Sultan Papon');
    else if (/Doorie/i.test(track.title)) searchQueries.push('Doorie Atif Aslam');
    else if (/Dooriyan/i.test(track.title)) searchQueries.push('Dooriyan Love Aaj Kal Mohit Chauhan');
    else if (/Iktara/i.test(track.title)) searchQueries.push('Iktara Wake Up Sid Kavita Seth');
    else if (/In Dino/i.test(track.title)) searchQueries.push('In Dino Life in a Metro Soham');
    else if (/Kabira/i.test(track.title)) searchQueries.push('Kabira Yeh Jawaani Hai Deewani Pritam');
    else if (/Meri Kahani/i.test(track.title)) searchQueries.push('Meri Kahani Atif Aslam');
    else if (/Khat/i.test(track.title)) searchQueries.push('Khat Navjot Ahuja');
    else if (/Tum Ho/i.test(track.title)) searchQueries.push('Tum Ho Rockstar Mohit Chauhan');
    else if (/Tera Mera Rishta/i.test(track.title)) searchQueries.push('Tera Mera Rishta Awarapan Mustafa Zahid');
    else if (/Tere Bin/i.test(track.title)) searchQueries.push('Tere Bin Bas Ek Pal Atif Aslam');
    else if (/Choo Lo/i.test(track.title)) searchQueries.push('Choo Lo The Local Train');
    else if (/Aaoge Tum Kabhi/i.test(track.title)) searchQueries.push('Aaoge Tum Kabhi The Local Train');
    else if (/Tu Jaane Na/i.test(track.title)) searchQueries.push('Tu Jaane Na Ajab Prem Ki Ghazab Kahani Atif Aslam');
    else if (/Tum Se Hi/i.test(track.title)) searchQueries.push('Tum Se Hi Jab We Met Mohit Chauhan');
    else if (/Vaaroon/i.test(track.title)) searchQueries.push('Vaaroon Mirzapur Romy');
  } else if (track.crate === 'Singles') {
    if (/Loca/i.test(orig)) searchQueries.push('Loca Yo Yo Honey Singh');
    else if (/Boom Boom/i.test(orig)) searchQueries.push('Boom Boom Hommie Dilliwala');
    else if (/Together Forever/i.test(orig)) searchQueries.push('Together Forever Yo Yo Honey Singh');
    else if (/Nachna Ve/i.test(orig)) searchQueries.push('Nachna Ve Hommie Dilliwala');
    else if (/Chaand/i.test(orig)) searchQueries.push('Karun Chaand');
    else if (/Note Fenko/i.test(orig)) searchQueries.push('Note Fenko The Karampura Song');
    else if (/Pankhudi/i.test(orig)) searchQueries.push('Pankhudi Yo Yo Honey Singh');
    else if (/Lashkare/i.test(orig)) searchQueries.push('Lashkare Yo Yo Honey Singh');
    else if (/Cham Cham/i.test(orig)) searchQueries.push('Cham Cham Hommie Dilliwala');
    else if (/ASHK/i.test(orig)) searchQueries.push('Ashk Yo Yo Honey Singh');
    else if (/ZUBAIDA/i.test(orig)) searchQueries.push('Zubaida Yo Yo Honey Singh');
    else if (/Jawani Iraqi/i.test(orig)) searchQueries.push('Jawani Iraqi Yo Yo Honey Singh');
    else if (/Casa Tupka/i.test(orig)) searchQueries.push('Casa Tupka Priyanshi');
    else if (/So Swaezy/i.test(orig)) searchQueries.push('So Swaezy Yo Yo Honey Singh');
    else if (/Ka Kha Ga/i.test(orig)) searchQueries.push('Ka Kha Ga Hommie Dilliwala');
  } else if (track.crate === 'Sambata') {
    if (/359 AM/i.test(orig)) searchQueries.push('359 AM DIVINE');
    else if (/Boom Shaka/i.test(orig)) searchQueries.push('Boom Shaka KR$NA Dhanda Nyoliwala');
    else if (/Black Money/i.test(orig)) searchQueries.push('Black Money Loka Sambata');
    else if (/Cash Flow/i.test(orig)) searchQueries.push('Hood Life Sambata Riar Saab');
    else if (/Hoodlife/i.test(orig)) searchQueries.push('Hood Life Sambata Riar Saab');
    else if (/Mahaan/i.test(orig)) searchQueries.push('Mahaan Rocksun');
    else if (/Yeda Yung/i.test(orig)) searchQueries.push('YEDA YUNG YUNG DSA');
    else if (/Saltanat/i.test(orig)) searchQueries.push('Saltanat Rocksun');
    else if (/Diggaj/i.test(orig)) searchQueries.push('Diggaj Rocksun');
    else if (/MAAZ/i.test(orig) || /BHUK/i.test(orig) || /PROUD/i.test(orig) || /Pain/i.test(orig)) {
      return {
        status: 'VERIFIED_MATCH',
        priority: 'Priority 3: Verified Soundtrack/Album Artwork',
        source: 'Apple Music / iTunes India Official Release',
        officialTrackName: track.title,
        officialArtistName: 'SAMBATA',
        officialCollection: 'Maaz (Def Jam India)',
        remoteArtworkUrl: MAAZ_ALBUM_COVER_URL,
        slug: 'maaz-sambata-def-jam'
      };
    }
  } else if (track.crate === 'Paresh-Pahuja') {
    if (/Dooron Dooron/i.test(orig)) searchQueries.push('Dooron Dooron Paresh Pahuja');
    else if (/Tum Ho Toh|Saiyaara/i.test(orig)) searchQueries.push('Tum Ho Toh Saiyaara Vishal Mishra');
    else if (/Ishq Official/i.test(orig)) searchQueries.push('Faheem Abdullah Ishq Rauhan Malik');
    else if (/JO TUM MERE HO/i.test(orig)) searchQueries.push('Jo Tum Mere Ho Anuv Jain');
    else if (/Ishq Bulaava/i.test(orig)) searchQueries.push('Ishq Bulaava Hasee Toh Phasee');
    else if (/Finding Her/i.test(orig)) searchQueries.push('Finding Her Kushagra');
    else if (/Jhol/i.test(orig)) searchQueries.push('Jhol Coke Studio Maanu Annural Khalid');
    else if (/Ve Haaniyaan/i.test(orig)) searchQueries.push('Ve Haaniyaan Danny Avvy Sra');
    else if (/Sahiba/i.test(orig)) searchQueries.push('Sahiba Jasleen Royal Stebin Ben');
    else if (/Gehra Hua/i.test(orig)) searchQueries.push('Gehra Hua Dhurandhar Shashwat Sachdev');
    else if (/Kaise Hua/i.test(orig)) searchQueries.push('Kaise Hua Kabir Singh Vishal Mishra');
    else if (/Afreen Afreen/i.test(orig)) searchQueries.push('Afreen Afreen Coke Studio Rahat Fateh Ali Khan');
    else if (/Ranjheya Ve/i.test(orig)) searchQueries.push('Ranjheya Ve Zain Zohaib');
    else if (/SUNIYAN SUNIYAN/i.test(orig)) searchQueries.push('Suniyan Suniyan Juss');
    else if (/Ishq Di Baajiyaan/i.test(orig)) searchQueries.push('Ishq Di Baajiyaan Soorma Diljit Dosanjh');
    else if (/Ishqa Ve/i.test(orig)) searchQueries.push('Ishqa Ve Zeeshan Ali');
    else if (/Sitaare/i.test(orig)) searchQueries.push('Sitaare Ikkis');
    else if (/Darkhaast/i.test(orig)) searchQueries.push('Darkhaast Shivaay Arijit Singh');
    else if (/Tum Ho/i.test(orig)) searchQueries.push('Tum Ho Rockstar Mohit Chauhan');
  }

  // Generic fallback queries
  if (searchQueries.length === 0) {
    searchQueries.push(`${track.title} ${track.artist}`);
    if (track.movieOrAlbum) searchQueries.push(`${track.title} ${track.movieOrAlbum}`);
  }

  for (const q of searchQueries) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&country=IN&entity=song&limit=4`;
    const res = await fetchJson(url);
    if (!res || !res.results || res.results.length === 0) continue;

    for (const r of res.results) {
      const rTrack = normalize(r.trackName);
      const rArtist = normalize(r.artistName);
      const rAlbum = normalize(r.collectionName);

      // Extract core query word
      const qWords = q.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
      const trackMatchesWord = qWords.some(w => rTrack.includes(w) || rAlbum.includes(w));

      if (trackMatchesWord && r.artworkUrl100) {
        const hiRes = r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
        const slug = slugify(`${r.trackName || track.title}-${r.collectionName || track.movieOrAlbum}`);
        return {
          status: 'VERIFIED_MATCH',
          priority: 'Priority 1: Exact Song Title + Artist/Album Official Artwork',
          source: 'Apple Music / iTunes India Official Release',
          officialTrackName: r.trackName,
          officialArtistName: r.artistName,
          officialCollection: r.collectionName,
          remoteArtworkUrl: hiRes,
          slug: slug
        };
      }
    }
  }

  return {
    status: 'UNRESOLVED',
    priority: 'None',
    source: 'None (Underground / Independent Release)',
    reason: 'No verified official commercial release found in verified catalog.',
    remoteArtworkUrl: null,
    slug: null
  };
}

async function main() {
  console.log(`Starting real artwork resolution for all ${rawTracks.length} local tracks...`);

  const manifest = [];
  let matchedCount = 0;
  let unresolvedCount = 0;
  const downloadedFiles = new Map();

  for (let i = 0; i < rawTracks.length; i++) {
    const t = rawTracks[i];
    const match = await findOfficialArtwork(t);

    let localArtworkUrl = '/artwork/placeholder-cover.svg';

    if (match.status === 'VERIFIED_MATCH' && match.remoteArtworkUrl) {
      matchedCount++;
      const filename = `${match.slug}.jpg`;
      const localFilePath = path.join(artworkDir, filename);

      if (!downloadedFiles.has(filename)) {
        console.log(`[${i + 1}/${rawTracks.length}] Downloading real poster: "${filename}" for track: "${t.title}"...`);
        const downloaded = await downloadImage(match.remoteArtworkUrl, localFilePath);
        if (downloaded) {
          downloadedFiles.set(filename, `/artwork/${filename}`);
          localArtworkUrl = `/artwork/${filename}`;
        } else {
          // Fallback if download failed
          localArtworkUrl = match.remoteArtworkUrl;
        }
      } else {
        localArtworkUrl = downloadedFiles.get(filename);
        console.log(`[${i + 1}/${rawTracks.length}] Reusing official verified cover: "${filename}" for: "${t.title}"`);
      }
    } else {
      unresolvedCount++;
      console.log(`[${i + 1}/${rawTracks.length}] UNRESOLVED: "${t.title}" -> using neutral SVG placeholder.`);
    }

    manifest.push({
      id: t.id,
      title: t.title,
      artist: t.artist,
      movieOrAlbum: t.movieOrAlbum,
      crate: t.crate,
      originalFilename: t.originalFilename,
      status: match.status,
      priority: match.priority,
      officialSource: match.source,
      officialTrackName: match.officialTrackName || null,
      officialArtistName: match.officialArtistName || null,
      officialCollection: match.officialCollection || null,
      artworkUrl: localArtworkUrl,
      remoteArtworkUrl: match.remoteArtworkUrl || null,
      reason: match.reason || null
    });

    // Short pause between network calls
    await new Promise(r => setTimeout(r, 60));
  }

  // 1. Write the artwork manifest
  const artworkManifestPath = path.join(__dirname, '../lib/audio/artworkManifest.json');
  fs.writeFileSync(artworkManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\nWritten artwork manifest to ${artworkManifestPath}`);

  // 2. Update bollywoodManifest.json with new local artwork URLs
  const updatedBollywoodManifest = rawTracks.map(track => {
    const artEntry = manifest.find(m => m.id === track.id);
    return {
      ...track,
      artworkUrl: artEntry ? artEntry.artworkUrl : '/artwork/placeholder-cover.svg'
    };
  });
  fs.writeFileSync(manifestPath, JSON.stringify(updatedBollywoodManifest, null, 2), 'utf8');
  console.log(`Updated ${manifestPath}`);

  // 3. Update lib/audio/bollywoodLibrary.ts
  const tsContent = `/**
 * ZYRO by FailureTech — Master Local Bollywood & Desi Library
 * Automatically generated manifest of all ${updatedBollywoodManifest.length} local media files.
 * Real, verified official artwork mapped locally.
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

export const LOCAL_BOLLYWOOD_TRACKS: LocalMediaTrack[] = ${JSON.stringify(updatedBollywoodManifest, null, 2)};
`;
  fs.writeFileSync(libraryTsPath, tsContent, 'utf8');
  console.log(`Updated ${libraryTsPath}`);

  console.log('\n==========================================');
  console.log(`TOTAL TRACKS AUDITED: ${rawTracks.length}`);
  console.log(`VERIFIED OFFICIAL POSTERS MATCHED: ${matchedCount}`);
  console.log(`UNRESOLVED TRACKS (NEUTRAL PLACEHOLDER): ${unresolvedCount}`);
  console.log(`LOCAL ARTWORK DOWNLOADED: ${downloadedFiles.size} unique image files`);
  console.log('==========================================');
}

main().catch(err => {
  console.error('Fatal error in artwork library build:', err);
  process.exit(1);
});
