const fs = require('fs');
const photoDB = JSON.parse(fs.readFileSync('photo_db.json', 'utf8'));

const updates = {
    's4': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Students_singing_on_the_stage_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    's5': 'https://upload.wikimedia.org/wikipedia/commons/c/c6/A_public_high_school_choir_in_the_United_States_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    's6': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Chengdu_Opera_dressing_room_1992.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    's7': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Chengdu_Opera_dressing_room_1992.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original'
};

for (const [id, url] of Object.entries(updates)) {
    const photo = photoDB.find(p => p.id === id);
    if (photo) photo.url = url;
}

fs.writeFileSync('photo_db.json', JSON.stringify(photoDB, null, 2));
console.log('Updated s4-s7 URLs');
