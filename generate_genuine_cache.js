require('dotenv').config();
const { GoogleGenAI, Type } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI({});
const cache = {};
const logs = [];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function executeWithAggressiveRetry(fn, type, query, clue) {
    let retries = 0;
    while (true) {
        try {
            return await fn();
        } catch (e) {
            retries++;
            console.log(`[${type}] ${query} ${clue || ''} - Error: ${e.status || e.message}. Retrying... (${retries})`);
            await delay(15000); // Wait 15s to bypass both 429 and 503 limits
        }
    }
}

async function getClarification(query) {
    const promptText = `A user searched for "${query}" in Google Photos, but the search failed because it was either too broad (millions of results) or had zero exact matches (or returned incorrect semantic domains).
We need to ask the user a clarification question to narrow down the search. 
Analyze the query and identify 1 or 2 missing semantic dimensions (e.g., Time, Location, People, Event, Object Color, Specific Context).
For each missing dimension, provide a natural, conversational question to ask the user, and generate 3 highly plausible answer options (chips) the user might click.`;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING },
                prompt: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["type", "prompt", "options"]
        }
    };

    return await executeWithAggressiveRetry(async () => {
        const startTime = new Date();
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptText,
            config: { responseMimeType: 'application/json', responseSchema: responseSchema, temperature: 0.2 }
        });
        
        logs.push({
            type: 'Clarification',
            query: query,
            timestamp: startTime.toISOString(),
            rawResponse: response.text
        });
        
        return JSON.parse(response.text);
    }, 'Clarification', query);
}

async function getSynthesis(originalQuery, clueType, clueValue) {
    const promptText = `A user searched for "${originalQuery}" in Google Photos, but the search failed. 
We asked them a clarification question based on the missing dimension "${clueType}". 
The user provided this clue: "${clueValue}".
Synthesize a single, highly specific natural language search query that combines the original query and the new clue.
Output only the synthesized query text, nothing else.`;

    return await executeWithAggressiveRetry(async () => {
        const startTime = new Date();
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptText,
            config: { temperature: 0.1 }
        });
        
        logs.push({
            type: 'Synthesis',
            query: originalQuery,
            clue: clueValue,
            timestamp: startTime.toISOString(),
            rawResponse: response.text.trim()
        });
        
        return response.text.trim();
    }, 'Synthesis', originalQuery, clueValue);
}

async function run() {
    const queries = ['passport', 'cricket', 'whiteboard', 'school', 'annual day'];
    
    for (const q of queries) {
        console.log(`Generating clarification for ${q}...`);
        const clarification = await getClarification(q);
        cache[q] = { clarification, synthesis: {} };
        await delay(13000); 
        
        const firstPrompt = clarification[0];
        if (firstPrompt && firstPrompt.options) {
            for (let i = 0; i < 3; i++) { 
                if (!firstPrompt.options[i]) continue;
                const chip = firstPrompt.options[i];
                console.log(`Generating synthesis for ${q} + ${chip}...`);
                cache[q].synthesis[chip] = await getSynthesis(q, firstPrompt.type, chip);
                await delay(13000);
            }
        }
    }
    
    fs.writeFileSync('genuine_demo_cache.json', JSON.stringify(cache, null, 2));
    fs.writeFileSync('api_logs_proof.json', JSON.stringify(logs, null, 2));
    console.log("Finished generating genuine LLM cache!");
}

run();
