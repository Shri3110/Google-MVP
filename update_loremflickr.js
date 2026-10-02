const fs = require('fs');
const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

// We use lock=id to ensure the image never changes between pageloads.
let idCounter = 1;

function getKeywords(desc) {
    if (desc.includes('Honda Passport')) return 'suv,honda';
    if (desc.includes('Studio Portrait')) return 'portrait,face';
    if (desc.includes('White background portrait')) return 'portrait,headshot';
    if (desc.includes('IPL Stadium')) return 'stadium,cricket';
    if (desc.includes('Local cricket team')) return 'cricket,match';
    if (desc.includes('Batsman hitting')) return 'cricket,batsman';
    if (desc.includes('insect')) return 'insect,macro';
    if (desc.includes('Cricket bat')) return 'cricket,bat';
    if (desc.includes('Cricket pads')) return 'cricket,equipment';
    if (desc.includes('Blank whiteboard')) return 'whiteboard,blank';
    if (desc.includes('Empty board')) return 'whiteboard,empty';
    if (desc.includes('Whiteboard with math')) return 'whiteboard,math';
    if (desc.includes('Brainstorming')) return 'whiteboard,notes';
    if (desc.includes('flowchart')) return 'flowchart,diagram';
    if (desc.includes('Architecture diagram')) return 'architecture,diagram';
    if (desc.includes('White wall')) return 'white,wall';
    if (desc.includes('School sports')) return 'school,sports';
    if (desc.includes('School exterior')) return 'school,building';
    if (desc.includes('Inside classroom')) return 'classroom,desks';
    if (desc.includes('Annual day')) return 'stage,kids,performance';
    if (desc.includes('Singing performance')) return 'singing,stage';
    if (desc.includes('Getting ready backstage')) return 'backstage,makeup';
    if (desc.includes('Costume preparation')) return 'costume,kids';
    if (desc.includes('Class group photo')) return 'class,group,kids';
    if (desc.includes('Adult concert')) return 'concert,stage';
    return 'photo';
}

for (let photo of photoDB) {
    if (photo.url.includes('placehold.co') || photo.url.includes('picsum') || photo.url.includes('unsplash')) {
        const keywords = getKeywords(photo.desc);
        photo.url = `https://loremflickr.com/600/400/${keywords}?lock=${idCounter++}`;
    }
}

fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
console.log("Updated photo_db.json with LoremFlickr URLs.");
