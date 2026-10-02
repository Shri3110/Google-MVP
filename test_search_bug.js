const fs = require('fs');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

function mockCoreSearch(query) {
    const STOP_WORDS = new Set(['photos', 'photo', 'of', 'the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'with', 'and', 'is', 'style', 'my']);
    const qTokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));
    
    let scoredPhotos = photoDB.map(photo => {
        let score = 0;
        const descStr = photo.desc.toLowerCase();
        const tagStr = photo.tags.join(' ').toLowerCase();
        
        qTokens.forEach(token => {
            const regex = new RegExp(`\\b${token}\\b`, 'i');
            if (regex.test(tagStr)) {
                score += 3;
            } else if (regex.test(descStr)) {
                score += 1;
            }
        });
        
        return { ...photo, score };
    });
    
    let matchedPhotos = scoredPhotos.filter(p => p.score > 0).sort((a, b) => b.score - a.score);
    
    // Drop weak matches if it's a highly specific (refined) query
    if (matchedPhotos.length > 0) {
        const maxScore = matchedPhotos[0].score;
        if (maxScore > 3) {
            // A score > 3 means multiple tokens matched. Drop weak baseline matches (score <= 3).
            matchedPhotos = matchedPhotos.filter(p => p.score > 3);
        }
    }
    
    return matchedPhotos.map(p => ({ id: p.id, desc: p.desc, tags: p.tags, score: p.score }));
}

console.log("=== BUG REPRODUCTION: 'Portrait style photos for passport' ===");
console.log(mockCoreSearch("Portrait style photos for passport"));

console.log("\n=== BUG REPRODUCTION: 'Photos of a Honda Passport vehicle' ===");
console.log(mockCoreSearch("Photos of a Honda Passport vehicle"));

console.log("\n=== BUG REPRODUCTION: 'passport' (Unrefined initial search) ===");
console.log(mockCoreSearch("passport").map(p => p.desc));
