const fs = require('fs');
const https = require('https');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

async function searchWikipedia(query) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&prop=pageimages&pithumbsize=600&format=json`;
        https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.query && json.query.pages) {
                        const pages = Object.values(json.query.pages);
                        // find first page that has a thumbnail
                        for (let page of pages) {
                            if (page.thumbnail && page.thumbnail.source) {
                                resolve(page.thumbnail.source);
                                return;
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
        if (!photo.url.startsWith('images/')) {
            let searchQuery = photo.desc;
            
            // Map descriptions to Wiki-friendly search terms
            if (searchQuery.includes('Honda Passport')) searchQuery = 'Honda Passport SUV';
            if (searchQuery.includes('Studio Portrait')) searchQuery = 'Portrait photography';
            if (searchQuery.includes('White background portrait')) searchQuery = 'Headshot photograph';
            if (searchQuery.includes('IPL Stadium')) searchQuery = 'Cricket stadium';
            if (searchQuery.includes('Local cricket team')) searchQuery = 'Cricket match';
            if (searchQuery.includes('Batsman hitting')) searchQuery = 'Cricket batting';
            if (searchQuery.includes('Cricket insect')) searchQuery = 'Gryllidae';
            if (searchQuery.includes('Brown cricket insect')) searchQuery = 'House cricket';
            if (searchQuery.includes('Cricket bat')) searchQuery = 'Cricket bat';
            if (searchQuery.includes('Cricket pads')) searchQuery = 'Cricket pads';
            if (searchQuery.includes('whiteboard')) searchQuery = 'Whiteboard';
            if (searchQuery.includes('Empty board')) searchQuery = 'Whiteboard';
            if (searchQuery.includes('Brainstorming notes')) searchQuery = 'Brainstorming';
            if (searchQuery.includes('Meeting flowchart')) searchQuery = 'Flowchart';
            if (searchQuery.includes('Architecture diagram')) searchQuery = 'Software architecture diagram';
            if (searchQuery.includes('White wall')) searchQuery = 'White wall';
            if (searchQuery.includes('School sports')) searchQuery = 'School sports day';
            if (searchQuery.includes('School exterior')) searchQuery = 'School building';
            if (searchQuery.includes('Inside classroom')) searchQuery = 'School classroom';
            if (searchQuery.includes('Annual day')) searchQuery = 'School play';
            if (searchQuery.includes('Singing performance')) searchQuery = 'Stage performance singing';
            if (searchQuery.includes('Getting ready backstage')) searchQuery = 'Backstage theatre';
            if (searchQuery.includes('Costume preparation')) searchQuery = 'Theatrical costume';
            if (searchQuery.includes('Class group photo')) searchQuery = 'Class photo';
            if (searchQuery.includes('Adult concert')) searchQuery = 'Music concert';

            console.log(`Searching Wiki for: ${searchQuery}`);
            const url = await searchWikipedia(searchQuery);
            if (url) {
                photo.url = url;
                console.log(` -> Found: ${url}`);
            } else {
                console.log(` -> Failed.`);
                photo.url = `https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg`;
            }
            await new Promise(r => setTimeout(r, 200));
        }
    }
    fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
    console.log('Done updating DB with reliable Wiki URLs!');
}

run();
