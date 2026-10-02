require('dotenv').config();
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
    for (let i = 1; i <= 4; i++) {
        console.log(`\n--- Run ${i} ---`);
        try {
            const response = await groq.chat.completions.create({
                messages: [{ role: 'user', content: 'Say exactly: "This is a test of the qwen model."' }],
                model: 'qwen/qwen3.8-27b',
                temperature: 0.1
            });
            console.log("Raw Response Metadata:");
            console.log(JSON.stringify(response, null, 2));
        } catch (e) {
            console.error(`Error on Run ${i}:`, e.message);
        }
    }
}
run();
