const fs = require('fs');
const https = require('https');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

async function searchCommons(query) {
    return new Promise((resolve) => {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json`;
        https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.query && json.query.pages) {
                        const pages = Object.values(json.query.pages);
                        if (pages.length > 0 && pages[0].imageinfo && pages[0].imageinfo.length > 0) {
                            resolve(pages[0].imageinfo[0].url);
                            return;
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
        if (photo.url.includes('picsum.photos')) {
            let searchQuery = photo.desc;
            
            // Map descriptions to Commons-friendly search terms
            if (searchQuery.includes('IPL Stadium')) searchQuery = 'Cricket stadium';
            if (searchQuery.includes('Local cricket team')) searchQuery = 'Cricket match amateur';
            if (searchQuery.includes('Batsman hitting')) searchQuery = 'Cricket batting';
            if (searchQuery.includes('Cricket insect')) searchQuery = 'Gryllidae';
            if (searchQuery.includes('Brown cricket insect')) searchQuery = 'Acheta domesticus';
            if (searchQuery.includes('Cricket bat')) searchQuery = 'Cricket bat';
            if (searchQuery.includes('Cricket pads')) searchQuery = 'Cricket equipment';
            if (searchQuery.includes('Blank whiteboard')) searchQuery = 'Blank whiteboard';
            if (searchQuery.includes('Empty board')) searchQuery = 'Whiteboard';
            if (searchQuery.includes('math notes')) searchQuery = 'Mathematics whiteboard';
            if (searchQuery.includes('Brainstorming notes')) searchQuery = 'Whiteboard brainstorming';
            if (searchQuery.includes('Meeting flowchart')) searchQuery = 'Flowchart whiteboard';
            if (searchQuery.includes('Architecture diagram')) searchQuery = 'Software architecture diagram';
            if (searchQuery.includes('White wall')) searchQuery = 'White wall empty';
            if (searchQuery.includes('School sports')) searchQuery = 'School sports day';
            if (searchQuery.includes('School exterior')) searchQuery = 'School building exterior';
            if (searchQuery.includes('Inside classroom')) searchQuery = 'Empty classroom';
            if (searchQuery.includes('Annual day')) searchQuery = 'School play performance';
            if (searchQuery.includes('Singing performance')) searchQuery = 'Stage singing performance';
            if (searchQuery.includes('Getting ready backstage')) searchQuery = 'Backstage theatre';
            if (searchQuery.includes('Costume preparation')) searchQuery = 'Theatrical costume';
            if (searchQuery.includes('Class group photo')) searchQuery = 'Class photo school';
            if (searchQuery.includes('Adult concert')) searchQuery = 'Music concert stage';

            console.log(`Searching Commons for: ${searchQuery}`);
            const url = await searchCommons(searchQuery);
            if (url) {
                photo.url = url;
                console.log(` -> Found: ${url}`);
            } else {
                console.log(` -> Failed. Trying broader term.`);
                // Fallback to broader term
                const fallbackUrl = await searchCommons(searchQuery.split(' ')[0]);
                if (fallbackUrl) {
                    photo.url = fallbackUrl;
                    console.log(` -> Found fallback: ${fallbackUrl}`);
                } else {
                    photo.url = `https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg`;
                }
            }
            await new Promise(r => setTimeout(r, 200));
        }
    }
    fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
    console.log('Done updating DB with reliable Commons URLs!');
}

run();
