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
    // First, fix c1-c7 to use local images
    for (let i = 1; i <= 7; i++) {
        const photo = photoDB.find(p => p.id === `c${i}`);
        if (photo) photo.url = `images/c${i}.jpg`;
    }

    const mapping = {
        'w4': 'Brainstorming',
        'w5': 'Flowchart',
        'w6': 'System architecture diagram',
        'w7': 'Blank wall',
        's1': 'School sports',
        's2': 'High school building',
        's3': 'School classroom desks',
        's4': 'School play',
        's5': 'Singing on stage',
        's6': 'Theatre backstage',
        's7': 'Theatrical costumes',
        's8': 'Group of students'
    };

    for (const [id, query] of Object.entries(mapping)) {
        const photo = photoDB.find(p => p.id === id);
        if (photo) {
            console.log(`Searching for: ${query}`);
            const url = await searchCommons(query);
            if (url) {
                photo.url = url;
            } else {
                photo.url = "https://upload.wikimedia.org/wikipedia/commons/5/5c/Blank_whiteboard.JPG"; // fallback
            }
            await new Promise(r => setTimeout(r, 200));
        }
    }

    fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
    console.log("Done");
}

run();
