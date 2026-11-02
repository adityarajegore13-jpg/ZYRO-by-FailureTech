const https = require('https');

function searchDeezer(query) {
  return new Promise((resolve) => {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    https.get(url, { headers: { 'User-Agent': 'ZYRO-Music/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function test() {
  const tests = ['Sambata Pinnak', 'Sambata Maaz', 'Sambata Gangster Shit', 'Yo Yo Honey Singh Boom Boom', 'Yo Yo Honey Singh Ka Kha Ga'];
  for (const q of tests) {
    const results = await searchDeezer(q);
    if (results.length > 0) {
      const top = results[0];
      console.log(`[DEEZER MATCH] ${q} => "${top.title}" by "${top.artist?.name}" | Album: "${top.album?.title}" | Cover: ${top.album?.cover_big}`);
    } else {
      console.log(`[DEEZER NO MATCH] ${q}`);
    }
  }
}

test();
