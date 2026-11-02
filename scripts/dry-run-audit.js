const fs = require('fs');
const path = require('path');
const https = require('https');

const manifestPath = path.join(__dirname, '../lib/audio/bollywoodManifest.json');
const tracks = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

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

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function searchTrack(title, artist, album) {
  // Try combinations
  const queries = [
    `${title} ${artist}`,
    `${title} ${album}`,
    `${title}`,
    `${album} ${artist}`
  ].filter(Boolean);

  for (const q of queries) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&country=IN&entity=song&limit=5`;
    const res = await fetchJson(url);
    if (!res || !res.results) continue;

    for (const r of res.results) {
      const rTrack = normalize(r.trackName);
      const rArtist = normalize(r.artistName);
      const rAlbum = normalize(r.collectionName);
      const qTitle = normalize(title);
      const qArtist = normalize(artist);
      const qAlbum = normalize(album);

      // Check for title match
      const titleMatches = qTitle && (rTrack.includes(qTitle) || qTitle.includes(rTrack));
      const albumMatches = qAlbum && (rAlbum.includes(qAlbum) || qAlbum.includes(rAlbum));
      const artistMatches = qArtist && (rArtist.includes(qArtist) || qArtist.includes(rArtist));

      if (titleMatches && (artistMatches || albumMatches)) {
        return {
          source: 'itunes',
          priority: 1,
          matchedTrack: r.trackName,
          matchedArtist: r.artistName,
          matchedAlbum: r.collectionName,
          artworkUrl: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : null
        };
      }

      if (titleMatches && !qArtist && !qAlbum) {
        return {
          source: 'itunes',
          priority: 2,
          matchedTrack: r.trackName,
          matchedArtist: r.artistName,
          matchedAlbum: r.collectionName,
          artworkUrl: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : null
        };
      }

      if (albumMatches && (qAlbum.length > 4) && (artistMatches || rAlbum.includes('soundtrack'))) {
        return {
          source: 'itunes',
          priority: 3,
          matchedTrack: r.trackName,
          matchedArtist: r.artistName,
          matchedAlbum: r.collectionName,
          artworkUrl: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : null
        };
      }
    }
  }

  return null;
}

async function dryRun() {
  console.log(`Auditing ${tracks.length} tracks...`);
  let matched = 0;
  let unresolved = 0;
  const results = [];

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    // Clean search terms
    let cleanTitle = t.title;
    // Strip "FULL VIDEO Song", "(Official Audio)", "Teaser", numbers, etc.
    cleanTitle = cleanTitle.replace(/^\d+[\.\s]+/, '')
      .replace(/\(Official.*?\)/gi, '')
      .replace(/FULL VIDEO.*?$/gi, '')
      .replace(/Lyrical.*?$/gi, '')
      .replace(/Teaser.*?$/gi, '')
      .trim();

    const match = await searchTrack(cleanTitle, t.artist, t.movieOrAlbum);
    if (match && match.artworkUrl) {
      matched++;
      results.push({ id: t.id, title: t.title, status: 'MATCHED', match });
      console.log(`[${i + 1}/${tracks.length}] MATCHED: "${t.title}" -> "${match.matchedTrack}" (${match.matchedAlbum})`);
    } else {
      unresolved++;
      results.push({ id: t.id, title: t.title, status: 'UNRESOLVED' });
      console.log(`[${i + 1}/${tracks.length}] UNRESOLVED: "${t.title}" [Artist: ${t.artist}, Album: ${t.movieOrAlbum}]`);
    }

    // Brief delay to be polite to Apple search API
    await new Promise(r => setTimeout(r, 120));
  }

  console.log(`\n--- AUDIT SUMMARY ---`);
  console.log(`Total Inspected: ${tracks.length}`);
  console.log(`Matched: ${matched}`);
  console.log(`Unresolved: ${unresolved}`);
}

dryRun();
