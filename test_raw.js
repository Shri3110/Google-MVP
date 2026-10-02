require('dotenv').config();
async function run() {
    const key = process.env.GEMINI_API_KEY;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            contents: [{parts: [{text: "hello"}]}]
        })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
run();
