const fs = require('fs');
const https = require('https');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

async function searchWikimedia(query) {
    return new Promise((resolve) => {
        // We use the action=query&generator=search API
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&prop=imageinfo&iiprop=url&format=json`;
        https.get(url, { headers: { 'User-Agent': 'AskPhotosDemo/1.0 (contact@example.com)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.query && json.query.pages) {
                        const pages = Object.values(json.query.pages);
                        if (pages.length > 0) {
                            // Find the first one with a valid URL
                            for (const page of pages) {
                                if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
                                    resolve(page.imageinfo[0].url);
                                    return;
                                }
                            }
                        }
                    }
                    resolve(null);
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function run() {
    for (let photo of photoDB) {
        if (photo.url.includes('loremflickr') || photo.url.includes('placehold.co') || photo.url.includes('picsum')) {
            let searchQuery = photo.desc;
            if (searchQuery.includes('Honda Passport')) searchQuery = 'Honda Passport SUV';
            if (searchQuery.includes('Studio Portrait')) searchQuery = 'Studio Portrait Headshot';
            if (searchQuery.includes('Cricket insect')) searchQuery = 'Gryllidae'; // scientific name for better match
            if (searchQuery.includes('Local cricket team')) searchQuery = 'Cricket match team';
            if (searchQuery.includes('Whiteboard')) searchQuery = 'Whiteboard marker';
            if (searchQuery.includes('Annual day')) searchQuery = 'School play performance';
            
            console.log(`Searching for: ${searchQuery}`);
            let url = await searchWikimedia(searchQuery);
            if (url) {
                photo.url = url;
                console.log(` -> Found: ${url}`);
            } else {
                console.log(` -> Failed.`);
                // fallback to a generic placeholder that definitely works (wikimedia logo)
                photo.url = `https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg`;
            }
            await new Promise(r => setTimeout(r, 500));
        }
    }
    fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
    console.log('Done updating DB with Wikimedia Commons URLs!');
}

run();
