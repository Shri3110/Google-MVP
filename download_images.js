const fs = require('fs');
const https = require('https');
const path = require('path');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));
const imagesDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

function downloadImage(url, filename, retries = 1) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadImage(res.headers.location, filename, retries).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                if (retries > 0) {
                    console.log(`   (Rate limited, retrying in 2s...)`);
                    setTimeout(() => {
                        downloadImage(url, filename, retries - 1).then(resolve).catch(reject);
                    }, 2000);
                    return;
                }
                resolve(false);
                return;
            }
            const fileStream = fs.createWriteStream(filename);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(true);
            });
        });
        req.on('error', (e) => resolve(false));
    });
}

async function run() {
    let idCounter = 1;
    for (let photo of photoDB) {
        if (photo.url.includes('pollinations.ai') || photo.url.includes('loremflickr') || photo.url.includes('wikimedia') || photo.url.includes('placehold.co')) {
            let prompt = photo.desc;
            if (prompt.includes('Honda Passport')) prompt += ' SUV photorealistic car photography';
            if (prompt.includes('Portrait')) prompt += ' professional photography headshot';
            if (prompt.includes('insect')) prompt += ' macro photography national geographic';
            if (prompt.includes('whiteboard') || prompt.includes('board') || prompt.includes('notes') || prompt.includes('flowchart') || prompt.includes('diagram')) prompt += ' office meeting whiteboard drawing';
            if (prompt.includes('School') || prompt.includes('classroom')) prompt += ' modern high school education';
            if (prompt.includes('performance') || prompt.includes('concert') || prompt.includes('stage') || prompt.includes('backstage') || prompt.includes('Costume')) prompt += ' school auditorium stage play';
            if (prompt.includes('team') || prompt.includes('IPL') || prompt.includes('Batsman') || prompt.includes('Cricket')) prompt += ' cricket match stadium sports action';

            const encodedPrompt = encodeURIComponent(prompt).replace(/%20/g, '-');
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=400&nologo=true&seed=${idCounter++}`;
            
            const filename = `stock_${photo.id}.jpg`;
            const filepath = path.join(imagesDir, filename);
            
            console.log(`Downloading ${filename} from Pollinations...`);
            const success = await downloadImage(imageUrl, filepath);
            
            if (success) {
                photo.url = `images/${filename}`;
                console.log(` -> Saved locally as images/${filename}`);
            } else {
                console.log(` -> Failed to download.`);
            }
            // long delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 4000));
        }
    }
    fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
    console.log('All images downloaded and DB updated to use local paths!');
}

run();
