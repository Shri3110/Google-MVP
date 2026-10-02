const fs = require('fs');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

function mockCoreSearch(query) {
    const qTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2 && t !== 'photos' && t !== 'of' && t !== 'the' && t !== 'a');
    let scoredPhotos = photoDB.map(photo => {
        let score = 0;
        const descTokens = photo.desc.toLowerCase().split(/\s+/);
        qTokens.forEach(token => {
            if (photo.tags.some(tag => tag.toLowerCase().includes(token))) score += 3;
            else if (descTokens.some(dt => dt.includes(token))) score += 1;
        });
        return { ...photo, score };
    });
    let matchedPhotos = scoredPhotos.filter(p => p.score > 0).sort((a, b) => b.score - a.score);
    return matchedPhotos.map(p => ({ id: p.id, desc: p.desc, tags: p.tags, score: p.score }));
}

console.log("=== Query: 'Photos of a passport booklet' ===");
console.log(mockCoreSearch("Photos of a passport booklet").slice(0, 5));

console.log("\n=== Query: 'Photos of a Honda Passport vehicle' ===");
console.log(mockCoreSearch("Photos of a Honda Passport vehicle").slice(0, 5));

console.log("\n=== Query: 'Photos of whiteboard meeting flowcharts' ===");
console.log(mockCoreSearch("Photos of whiteboard meeting flowcharts").slice(0, 5));

console.log("\n=== Query: 'Photos of school classroom' ===");
console.log(mockCoreSearch("Photos of school classroom").slice(0, 5));

console.log("\n=== Query: 'Photos of kids annual day performance on stage' ===");
console.log(mockCoreSearch("Photos of kids annual day performance on stage").slice(0, 5));
