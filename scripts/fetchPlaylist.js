const fs = require('fs');
const https = require('https');

const API_KEY = process.env.YOUTUBE_API_KEY;
const PLAYLIST_ID = process.env.PLAYLIST_ID;

async function fetchPage(pageToken = '') {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}&pageToken=${pageToken}`;

    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

(async () => {
  let nextPageToken = '';
  let allVideos = [];

  do {
    const data = await fetchPage(nextPageToken);

    data.items.forEach(item => {
      allVideos.push({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url
      });
    });

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/drdon.json', JSON.stringify(allVideos, null, 2));

  console.log(`Saved ${allVideos.length} videos.`);
})();