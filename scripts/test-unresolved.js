const https = require('https');

function searchITunes(query) {
  return new Promise((resolve) => {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=IN&entity=song&limit=3`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
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

const tests = [
  // Sambata crate non-Sambata tracks
  { title: '359 AM', query: 'DIVINE 359 AM' },
  { title: 'Boom Shaka', query: 'KR$NA Dhanda Nyoliwala Boom Shaka' },
  { title: 'Black Money', query: 'Loka Sambata Black Money' },
  { title: 'Cash Flow', query: 'Riar Saab Sambata Cash Flow' },
  { title: '295', query: 'Sidhu Moose Wala 295' },
  { title: 'YEDA YUNG', query: 'YUNG DSA YEDA YUNG' },
  { title: 'RADE RAPATE', query: 'YUNG DSA RADE RAPATE' },
  { title: 'SALTANAT', query: 'rocKsun SALTANAT' },
  { title: 'DIGGAJ', query: 'rocKsun DIGGAJ' },
  { title: 'MAHAAN', query: 'rocKsun MAHAAN' },
  { title: 'RX100', query: 'MC GAWTHI RX100' },
  { title: 'Naad Karaycha Nay', query: 'Mc Gawthi Sambata Naad Karaycha Nay' },

  // Sambata singles
  { title: 'Pinnak', query: 'SAMBATA Pinnak' },
  { title: 'Gangster Shit', query: 'SAMBATA Gangster Shit' },
  { title: 'Proud', query: 'SAMBATA Proud' },
  { title: 'Vazan', query: 'SAMBATA Vazan Karan Kanchan' },
  { title: 'Nako Raste Changle', query: 'SAMBATA Nako Raste Changle' },
  { title: 'Game', query: 'SAMBATA Game' },
  { title: 'Kaarte Nibaar', query: 'SAMBATA Kaarte Nibaar' },
  { title: 'Sod Lacharicha Paksh', query: 'SAMBATA Sod Lacharicha Paksh' },
  { title: 'Bhuk', query: 'SAMBATA Bhuk' },
  { title: 'Pain', query: 'SAMBATA Pain' },

  // Honey Singh crate
  { title: 'Boom Boom', query: 'Yo Yo Honey Singh Hommie Dilliwala Boom Boom' },
  { title: 'Ka Kha Ga', query: 'Hommie Dilliwala Ka Kha Ga' },
  { title: 'Chaand', query: 'Karun Chaand' },
  { title: 'Lashkare', query: 'Yo Yo Honey Singh Lashkare' },
  { title: 'Zubaida', query: 'Yo Yo Honey Singh Zubaida' },
  { title: 'God Style', query: 'Hommie Dilliwala God Style' },
  { title: 'Casa Tupka', query: 'Yo Yo Honey Singh Casa Tupka' },

  // Paresh Pahuja crate
  { title: 'Jo Tum Mere Ho', query: 'Anuv Jain Jo Tum Mere Ho' },
  { title: 'Ishq Bulaava', query: 'Hasee Toh Phasee Ishq Bulaava' },
  { title: 'Finding Her', query: 'Kushagra Finding Her' },
  { title: 'Jhol', query: 'Coke Studio Jhol Maanu Annural Khalid' },
  { title: 'Ve Haaniyaan', query: 'Danny Avvy Sra Ve Haaniyaan' },
  { title: 'Sahiba', query: 'Jasleen Royal Stebin Ben Sahiba' },
  { title: 'Gehra Hua', query: 'Dhurandhar Gehra Hua Shashwat Sachdev' },
  { title: 'Kaise Hua', query: 'Kabir Singh Kaise Hua Vishal Mishra' },
  { title: 'Afreen Afreen', query: 'Coke Studio Season 9 Afreen Afreen Rahat Fateh Ali Khan' },
  { title: 'Ranjheya Ve', query: 'Zain Zohaib Ranjheya Ve' },
  { title: 'Suniyan Suniyan', query: 'Juss Suniyan Suniyan' },
  { title: 'Ishq Di Baajiyaan', query: 'Soorma Ishq Di Baajiyaan Diljit Dosanjh' },
  { title: 'Ishqa Ve', query: 'Zeeshan Ali Ishqa Ve' },
  { title: 'Sitaare', query: 'Sitaare Ikkis' },
  { title: 'Darkhaast', query: 'Shivaay Darkhaast Arijit Singh' },
  { title: 'Ishq', query: 'Faheem Abdullah Rauhan Malik Ishq' }
];

async function run() {
  for (const t of tests) {
    const res = await searchITunes(t.query);
    if (res.length > 0) {
      const top = res[0];
      console.log(`[MATCH] ${t.title} => "${top.trackName}" | "${top.collectionName}" | "${top.artistName}"`);
      console.log(`   Artwork: ${top.artworkUrl100?.replace('100x100bb.jpg', '600x600bb.jpg')}`);
    } else {
      console.log(`[NO MATCH] ${t.title} (Query: ${t.query})`);
    }
    await new Promise(r => setTimeout(r, 100));
  }
}

run();
