require('dotenv').config();
const express = require('express');
const path = require('path');
const { Groq } = require('groq-sdk');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Phase 4: Configurable Thresholds
const THRESHOLDS = {
    OVERLOADED_RESULTS: 5,
    ZERO_MATCH: 0
};

// Phase 4: Simple In-Memory Cache for Latency Optimization (<200ms budget)
const promptCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache

// Load the pre-generated Demo Cache & Photo DB
const fs = require('fs');
let demoCache = {};
let photoDB = [];
try {
    demoCache = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo_cache.json'), 'utf8'));
    photoDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'photo_db.json'), 'utf8'));
} catch (e) {
    console.warn("Missing JSON files (demo_cache or photo_db).");
}

// Initialize Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️  WARNING: GROQ_API_KEY environment variable is missing. ML features will fail.");
}

// Real Keyword Search Engine against Photo DB
function mockCoreSearch(query) {
    const STOP_WORDS = new Set(['photos', 'photo', 'of', 'the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'with', 'and', 'is', 'style', 'my']);
    const qTokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));
    
    // Score photos based on match
    let scoredPhotos = photoDB.map(photo => {
        let score = 0;
        const descStr = photo.desc.toLowerCase();
        const tagStr = photo.tags.join(' ').toLowerCase();
        
        qTokens.forEach(token => {
            // Strip trailing 's' to handle simple plurals so 'insects' matches 'insect'
            const baseToken = token.endsWith('s') ? token.slice(0, -1) : token;
            const regex = new RegExp(`\\b(${baseToken}|${baseToken}s)\\b`, 'i');
            
            // Check tags (highest weight)
            if (regex.test(tagStr)) {
                score += 3;
            }
            // Check description (lower weight)
            else if (regex.test(descStr)) {
                score += 1;
            }
        });
        
        return { ...photo, score };
    });
    
    // Filter out zero scores and sort by score descending
    let matchedPhotos = scoredPhotos
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score);
        
    // Dynamic Thresholding: Drop weak matches if it's a highly specific (refined) query
    if (matchedPhotos.length > 0) {
        const maxScore = matchedPhotos[0].score;
        if (maxScore > 3) {
            // Drop any photos that missed a full keyword compared to the absolute best match
            matchedPhotos = matchedPhotos.filter(p => p.score > maxScore - 3);
        }
    }
        
    // Return them without the score property for the frontend
    matchedPhotos = matchedPhotos.map(p => ({ id: p.id, url: p.url, desc: p.desc, tags: p.tags }));

    return {
        count: matchedPhotos.length,
        photos: matchedPhotos
    };
}

// Live ML Query Analyzer & Clarification Service with Caching
async function generateClarificationPrompts(failedQuery) {
    // Phase 4: Cache hit check
    const cacheKey = failedQuery.toLowerCase().trim();
    
    // DEMO CACHE: Check for pre-generated demo responses first
    if (demoCache[cacheKey] && demoCache[cacheKey].clarification) {
        console.log(`[Demo Cache Hit] Serving pre-generated clarification for "${cacheKey}"`);
        return demoCache[cacheKey].clarification;
    }

    if (promptCache.has(cacheKey)) {
        const cached = promptCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
            console.log(`[Cache Hit] Returning prompts for "${cacheKey}" instantly (<5ms)`);
            return cached.data;
        }
    }

    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set.");
    }
    
    const promptText = `A user searched for "${failedQuery}" in Google Photos, but the search failed because it was either too broad (millions of results) or had zero exact matches (or returned incorrect semantic domains).
We need to ask the user a clarification question to narrow down the search. 
Analyze the query and identify 1 or 2 missing semantic dimensions (e.g., Time, Location, People, Event, Object Color, Specific Context).
For each missing dimension, provide a natural, conversational question to ask the user, and generate 3 highly plausible answer options (chips) the user might click.

You MUST return a JSON object with a single key "prompts", which is an array of objects.
Each object must have exactly these keys:
- "type" (string)
- "prompt" (string)
- "options" (array of 3 strings)

Example output:
{
  "prompts": [
    {
      "type": "Context",
      "prompt": "What kind of passport photo are you looking for?",
      "options": ["Passport booklet", "Portrait photo", "Honda Passport vehicle"]
    }
  ]
}`;

    try {
        const startTime = Date.now();
        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: promptText }],
            model: 'qwen/qwen3.8-27b',
            temperature: 0.2
        });
        
        let responseText = response.choices[0].message.content;
        
        // Strip out markdown code blocks if the model wrapped the JSON
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```/g, '').trim();
        }
        const parsed = JSON.parse(responseText);
        
        // Ensure the outer wrapper is stripped for compatibility with existing frontend
        const finalPrompts = parsed.prompts || [parsed];
        
        // Phase 4: Save to cache
        promptCache.set(cacheKey, { data: finalPrompts, timestamp: Date.now() });
        console.log(`[ML Latency - Groq] Prompt generation took ${Date.now() - startTime}ms`);
        
        return finalPrompts;
    } catch (error) {
        console.error("ML Error during Prompt Generation:", error);
        return [
            { 
                type: 'Context', 
                prompt: 'I found too many possibilities. Do you remember any specific details?', 
                options: ['Last year', 'My family', 'Not sure'] 
            }
        ];
    }
}

// Query Synthesis
async function synthesizeQuery(originalQuery, clueType, clueValue) {
    const qKey = originalQuery.toLowerCase().trim();
    if (demoCache[qKey] && demoCache[qKey].synthesis && demoCache[qKey].synthesis[clueValue]) {
        console.log(`[Demo Cache Hit] Serving pre-generated synthesis for "${qKey}" + "${clueValue}"`);
        return demoCache[qKey].synthesis[clueValue];
    }

    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set.");
    }
    
    const promptText = `A user searched for "${originalQuery}" in Google Photos, but the search failed. 
We asked them a clarification question based on the missing dimension "${clueType}". 
The user provided this clue: "${clueValue}".
Synthesize a single, highly specific natural language search query that combines the original query and the new clue.
Output only the synthesized query text, nothing else.`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: promptText }],
            model: 'qwen/qwen3.8-27b',
            temperature: 0.1
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("ML Error during Query Synthesis:", error);
        return `[FALLBACK] ${originalQuery} ${clueValue}`;
    }
}

// API Gateway - Search Endpoint
app.post('/api/search', async (req, res) => {
    const { query, clue } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    let finalQuery = query;

    try {
        if (clue) {
            finalQuery = await synthesizeQuery(query, clue.type, clue.value);
            console.log(`[Query Synthesis] Original: "${query}" + Clue: "${clue.value}" -> Final: "${finalQuery}"`);
        }

        const searchResult = mockCoreSearch(finalQuery);

        if (!clue) {
            if (searchResult.count === THRESHOLDS.ZERO_MATCH) {
                const prompts = await generateClarificationPrompts(query);
                return res.json({
                    status: 'failure',
                    reason: 'zero_match',
                    message: 'We couldn\'t find any photos matching your search.',
                    prompts,
                    results: searchResult.photos
                });
            }
            
            if (searchResult.count >= THRESHOLDS.OVERLOADED_RESULTS) {
                const prompts = await generateClarificationPrompts(query);
                return res.json({
                    status: 'failure',
                    reason: 'overloaded',
                    message: `We found ${searchResult.count} photos. Can you add a detail to help narrow it down?`,
                    prompts,
                    results: searchResult.photos
                });
            }
        }

        return res.json({
            status: 'success',
            query: finalQuery,
            results: searchResult.photos
        });
        
    } catch (err) {
        console.error("API Route Error:", err);
        return res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});

// Phase 4: Telemetry & Analytics Endpoint
app.post('/api/telemetry', (req, res) => {
    const { event, data, timestamp } = req.body;
    console.log(`[TELEMETRY] ${event} | ${new Date(timestamp).toISOString()} | Data:`, data);
    // In a real system, this would write to a BigQuery table or logging pipeline
    res.status(200).send('Logged');
});

app.listen(PORT, () => {
    console.log(`API Gateway & ML Services running on http://localhost:${PORT}`);
});
