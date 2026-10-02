async function test() {
    console.log("Testing live Groq Clarification for 'beach'...");
    const res = await fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'beach' })
    });
    console.log(await res.json());

    console.log("\nTesting live Groq Synthesis for 'beach' + 'Sunset'...");
    const res2 = await fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'beach', clue: { type: 'Time', value: 'Sunset' } })
    });
    console.log(await res2.json());
}
test();
