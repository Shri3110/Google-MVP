const fs = require('fs');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

for (let photo of photoDB) {
    if (photo.url.includes('pollinations.ai') || photo.url.includes('loremflickr') || photo.url.includes('wikimedia') || photo.url.includes('placehold.co') || photo.url.includes('picsum.photos/seed')) {
        photo.url = `https://picsum.photos/seed/${photo.id}picsum/600/400`;
    }
}

fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
console.log("Updated photo_db.json with reliable Picsum URLs.");
