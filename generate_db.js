const fs = require('fs');

const db = [
  // PASSPORT
  { id: 'p1', url: 'images/passport_open.jpg', desc: 'Passport pages', tags: ['passport', 'booklet', 'pages', 'document', 'travel', 'id'] },
  { id: 'p2', url: 'images/passport_cover.jpg', desc: 'Passport cover', tags: ['passport', 'booklet', 'cover', 'travel', 'document'] },
  { id: 'p3', url: 'images/visa_stamps.jpg', desc: 'Visa stamps', tags: ['passport', 'booklet', 'visa', 'stamps', 'travel'] },
  { id: 'p4', url: 'images/travel_doc.jpg', desc: 'Travel document', tags: ['passport', 'document', 'travel', 'boarding pass'] },
  { id: 'p5', url: 'https://placehold.co/600x400/94a3b8/ffffff?text=Honda+Passport+Front', desc: 'Honda Passport front view', tags: ['passport', 'honda', 'vehicle', 'car', 'suv'] },
  { id: 'p6', url: 'https://placehold.co/600x400/94a3b8/ffffff?text=Honda+Passport+Side', desc: 'Honda Passport side view', tags: ['passport', 'honda', 'vehicle', 'car', 'suv'] },
  { id: 'p7', url: 'https://placehold.co/600x400/94a3b8/ffffff?text=Honda+Passport+Interior', desc: 'Honda Passport interior', tags: ['passport', 'honda', 'vehicle', 'car', 'interior'] },
  { id: 'p8', url: 'https://placehold.co/600x400/cbd5e1/000000?text=Studio+Portrait', desc: 'Studio Portrait', tags: ['passport', 'portrait', 'photo', 'face', 'headshot'] },
  { id: 'p9', url: 'https://placehold.co/600x400/cbd5e1/000000?text=White+Background+Portrait', desc: 'White background portrait', tags: ['passport', 'portrait', 'photo', 'white background'] },
  { id: 'p10', url: 'images/screenshot_doc.jpg', desc: 'Random screenshot', tags: ['document', 'screenshot', 'text'] },
  { id: 'p11', url: 'images/invoice_doc.jpg', desc: 'Invoice', tags: ['document', 'invoice', 'receipt', 'tax'] },
  { id: 'p12', url: 'images/random_doc.jpg', desc: 'Tax form', tags: ['document', 'form', 'paper'] },

  // CRICKET
  { id: 'c1', url: 'https://placehold.co/600x400/4ade80/000000?text=IPL+Stadium', desc: 'IPL Stadium', tags: ['cricket', 'sport', 'match', 'ipl', 'stadium', 'team'] },
  { id: 'c2', url: 'https://placehold.co/600x400/22c55e/ffffff?text=Local+Cricket+Match', desc: 'Local cricket team', tags: ['cricket', 'sport', 'local', 'park', 'playing'] },
  { id: 'c3', url: 'https://placehold.co/600x400/22c55e/ffffff?text=Cricket+Batsman', desc: 'Batsman hitting', tags: ['cricket', 'sport', 'batsman', 'pitch'] },
  { id: 'c4', url: 'https://placehold.co/600x400/166534/ffffff?text=Cricket+Insect+Leaf', desc: 'Cricket insect on leaf', tags: ['cricket', 'insect', 'bug', 'nature', 'macro', 'leaf'] },
  { id: 'c5', url: 'https://placehold.co/600x400/166534/ffffff?text=Brown+Cricket+Bug', desc: 'Brown cricket insect', tags: ['cricket', 'insect', 'bug', 'brown', 'macro'] },
  { id: 'c6', url: 'https://placehold.co/600x400/eab308/000000?text=Cricket+Bat', desc: 'Cricket bat', tags: ['cricket', 'bat', 'kit', 'equipment', 'wood'] },
  { id: 'c7', url: 'https://placehold.co/600x400/eab308/000000?text=Cricket+Pads+Kit', desc: 'Cricket pads and kit', tags: ['cricket', 'kit', 'pads', 'gloves', 'helmet', 'equipment'] },

  // WHITEBOARD
  { id: 'w1', url: 'https://placehold.co/600x400/ffffff/000000?text=Blank+Whiteboard', desc: 'Blank whiteboard', tags: ['whiteboard', 'blank', 'empty', 'office', 'clean'] },
  { id: 'w2', url: 'https://placehold.co/600x400/eeeeee/000000?text=Empty+Board', desc: 'Empty board', tags: ['whiteboard', 'blank', 'empty', 'board'] },
  { id: 'w3', url: 'https://placehold.co/600x400/f8fafc/000000?text=Math+Notes', desc: 'Whiteboard with math notes', tags: ['whiteboard', 'notes', 'writing', 'math', 'marker'] },
  { id: 'w4', url: 'https://placehold.co/600x400/f8fafc/000000?text=Brainstorming+Notes', desc: 'Brainstorming notes', tags: ['whiteboard', 'notes', 'writing', 'words', 'marker'] },
  { id: 'w5', url: 'https://placehold.co/600x400/e2e8f0/000000?text=Meeting+Flowchart', desc: 'Meeting flowchart diagram', tags: ['whiteboard', 'diagram', 'meeting', 'flowchart', 'arrows'] },
  { id: 'w6', url: 'https://placehold.co/600x400/e2e8f0/000000?text=Architecture+Diagram', desc: 'Architecture diagram', tags: ['whiteboard', 'diagram', 'architecture', 'boxes', 'meeting'] },
  { id: 'w7', url: 'https://placehold.co/600x400/cccccc/000000?text=White+Wall', desc: 'White wall', tags: ['wall', 'white', 'blank', 'room'] }, // near miss

  // SCHOOL / ANNUAL DAY
  { id: 's1', url: 'https://placehold.co/600x400/f59e0b/ffffff?text=School+Sports+Day', desc: 'School sports event', tags: ['school', 'event', 'sports', 'kids', 'running'] },
  { id: 's2', url: 'https://placehold.co/600x400/d97706/ffffff?text=School+Building', desc: 'School exterior', tags: ['school', 'building', 'exterior', 'front', 'architecture'] },
  { id: 's3', url: 'https://placehold.co/600x400/fcd34d/000000?text=Inside+Classroom', desc: 'Inside classroom', tags: ['school', 'classroom', 'desks', 'board', 'inside'] },
  { id: 's4', url: 'https://placehold.co/600x400/8b5cf6/ffffff?text=Annual+Day+Stage', desc: 'Annual day performance', tags: ['school', 'annual day', 'performance', 'stage', 'dancing', 'kids', 'event'] },
  { id: 's5', url: 'https://placehold.co/600x400/7c3aed/ffffff?text=Singing+Performance', desc: 'Singing performance on stage', tags: ['annual day', 'performance', 'stage', 'singing', 'event'] },
  { id: 's6', url: 'https://placehold.co/600x400/c4b5fd/000000?text=Backstage+Makeup', desc: 'Getting ready backstage', tags: ['annual day', 'getting ready', 'behind the scenes', 'backstage', 'makeup', 'kids'] },
  { id: 's7', url: 'https://placehold.co/600x400/a78bfa/000000?text=Costume+Prep', desc: 'Costume preparation', tags: ['annual day', 'getting ready', 'behind the scenes', 'costumes'] },
  { id: 's8', url: 'https://placehold.co/600x400/6d28d9/ffffff?text=Class+Group+Photo', desc: 'Class group photo', tags: ['annual day', 'group photo', 'class', 'posing', 'together', 'school'] },
  { id: 's9', url: 'https://placehold.co/600x400/0284c7/ffffff?text=Generic+Concert', desc: 'Adult concert', tags: ['performance', 'stage', 'concert', 'adults', 'music'] } // near miss
];

fs.writeFileSync('photo_db.json', JSON.stringify(db, null, 2));
console.log("Database created with " + db.length + " photos.");
