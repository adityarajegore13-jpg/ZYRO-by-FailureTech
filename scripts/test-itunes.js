const https = require('https');

function searchITunes(query, country = 'IN') {
  return new Promise((resolve) => {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=${country}&entity=song&limit=3`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function test() {
  const tests = [
    'Anuv Jain HUSN',
    'Sidhu Moose Wala Built Different Moosetape',
    'Yo Yo Honey Singh Loca',
    'Sambata Pinnak',
    'Paresh Pahuja Dooron Dooron',
    'Kabira Yeh Jawaani Hai Deewani',
    'Sultan Bulleya Papon',
    'Love Aaj Kal Dooriyan Mohit Chauhan',
    'Awarapan Tera Mera Rishta',
    'Jab We Met Tum Se Hi'
  ];

  for (const q of tests) {
    const results = await searchITunes(q);
    if (results.length > 0) {
      const top = results[0];
      const hiResArt = top.artworkUrl100 ? top.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : '';
      console.log(`[MATCH] ${q} => "${top.trackName}" | Album: "${top.collectionName}" | Artist: "${top.artistName}"`);
      console.log(`   Artwork: ${hiResArt}`);
    } else {
      console.log(`[NO MATCH] ${q}`);
    }
  }
}

test();
