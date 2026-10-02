require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({});

async function run() {
    try {
        await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: 'hello'
        });
        console.log("Success");
    } catch(e) {
        console.error(e);
    }
}
run();
