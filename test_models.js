require('dotenv').config();
console.log("Key loaded:", !!process.env.GEMINI_API_KEY);
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI();

async function run() {
    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-002',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-1.0-pro'
    ];

    for (const m of modelsToTest) {
        try {
            const response = await ai.models.generateContent({
                model: m,
                contents: 'hello'
            });
            console.log(`Success with ${m}!`);
        } catch(e) {
            console.error(`${m} Error:`, e.status || e.message);
        }
    }
}
run();
