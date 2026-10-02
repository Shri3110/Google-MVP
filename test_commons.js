const https = require('https');

async function searchCommons(query) {
    return new Promise((resolve) => {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&prop=imageinfo&iiprop=url&format=json`;
        https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.query && json.query.pages) {
                        const results = Object.values(json.query.pages).map(p => p.imageinfo[0].url);
                        resolve(results);
                        return;
                    }
                    resolve([]);
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', () => resolve([]));
    });
}

async function run() {
    const queries = [
        "children school play",
        "kids stage performance",
        "school choir",
        "children singing stage",
        "makeup backstage kids",
        "dressing room backstage",
        "school uniforms costumes"
    ];
    for (const q of queries) {
        console.log(`\n--- ${q} ---`);
        const urls = await searchCommons(q);
        urls.forEach(u => console.log(u));
    }
}
run();
