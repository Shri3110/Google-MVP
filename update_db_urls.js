const fs = require('fs');
const https = require('https');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

async function searchUnsplash(query) {
    return new Promise((resolve, reject) => {
        const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=3`;
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.results && json.results.length > 0) {
                        // Pick random from top 3 to avoid duplicates if same query
                        const result = json.results[Math.floor(Math.random() * Math.min(3, json.results.length))];
                        resolve(result.urls.regular + "&w=600&h=400&fit=crop");
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function updateDB() {
    for (let photo of photoDB) {
        if (photo.url.includes('placehold.co')) {
            let searchQuery = photo.desc;
            // tweak queries for better stock photo matches
            if (searchQuery.includes('Honda Passport')) searchQuery = 'SUV car';
            if (searchQuery.includes('Cricket TV')) searchQuery = 'cricket match broadcast';
            if (searchQuery.includes('Cricket insect')) searchQuery = 'cricket insect macro';
            if (searchQuery.includes('Annual day')) searchQuery = 'school performance stage';
            
            console.log(`Searching for: ${searchQuery}`);
            const url = await searchUnsplash(searchQuery);
            if (url) {
                photo.url = url;
                console.log(` -> Found: ${url}`);
            } else {
                console.log(` -> Failed to find image for ${searchQuery}`);
                // fallback to picsum with a relevant seed so it's at least an image
                photo.url = `https://picsum.photos/seed/${photo.id}/600/400`;
            }
            // slight delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 500));
        }
    }
    fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
    console.log('Done updating DB!');
}

updateDB();
