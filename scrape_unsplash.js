const fs = require('fs');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

async function scrapeUnsplash(query) {
    const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query).replace(/%20/g, '-')}`;
    try {
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        const html = await response.text();
        // Regex to extract the first high-res Unsplash image URL
        const match = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+[^"'\s\?]*\?([^"'\s]+)/);
        if (match) {
            // Strip out query params and add our own for consistent size
            const baseUrl = match[0].split('?')[0];
            return `${baseUrl}?w=600&h=400&fit=crop`;
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function run() {
    for (let photo of photoDB) {
        if (photo.url.includes('placehold.co') || photo.url.includes('picsum')) {
            let searchQuery = photo.desc;
            if (searchQuery.includes('Honda Passport')) searchQuery = 'SUV car';
            if (searchQuery.includes('Cricket TV')) searchQuery = 'cricket match broadcast';
            if (searchQuery.includes('Cricket insect')) searchQuery = 'cricket insect macro';
            if (searchQuery.includes('Annual day')) searchQuery = 'school performance stage';
            
            console.log(`Searching for: ${searchQuery}`);
            const url = await scrapeUnsplash(searchQuery);
            if (url) {
                photo.url = url;
                console.log(` -> Found: ${url}`);
            } else {
                console.log(` -> Failed.`);
                photo.url = `https://picsum.photos/seed/${photo.id}/600/400`;
            }
            await new Promise(r => setTimeout(r, 800));
        }
    }
    fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
    console.log('Done!');
}

run();
