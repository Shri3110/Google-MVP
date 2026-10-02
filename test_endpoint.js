async function test() {
    console.log("Testing cached Clarification for 'cricket'...");
    const res = await fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'cricket' })
    });
    console.log(await res.json());

    console.log("\nTesting cached Synthesis for 'cricket' + 'Cricket the insect'...");
    const res2 = await fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'cricket', clue: { type: 'Subject', value: 'Cricket the insect' } })
    });
    console.log(await res2.json());
}
test();
