const fs = require('fs');

const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

let idCounter = 1;
for (let photo of photoDB) {
    if (photo.url.includes('loremflickr') || photo.url.includes('placehold.co') || photo.url.includes('picsum') || photo.url.includes('wikimedia')) {
        let prompt = photo.desc;
        // Improve prompts for better generation
        if (prompt.includes('Honda Passport')) prompt += ' SUV photorealistic car photography';
        if (prompt.includes('Portrait')) prompt += ' professional photography headshot';
        if (prompt.includes('insect')) prompt += ' macro photography national geographic';
        if (prompt.includes('whiteboard')) prompt += ' office meeting whiteboard drawing';
        
        const encodedPrompt = encodeURIComponent(prompt).replace(/%20/g, '-');
        photo.url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=400&nologo=true&seed=${idCounter++}`;
    }
}

fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
console.log("Updated photo_db.json with Pollinations.ai URLs.");
