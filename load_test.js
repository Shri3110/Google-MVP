async function test() {
    let successes = 0;
    let failures = 0;
    
    for (let i = 0; i < 10; i++) {
        try {
            const res = await fetch('http://localhost:3000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: 'passport', clue: { type: 'Context', value: 'Honda' } })
            });
            const data = await res.json();
            if (data.query.includes('[FALLBACK]')) {
                failures++;
            } else {
                successes++;
            }
        } catch (e) {
            failures++;
        }
    }
    
    console.log(`Load test complete. Successes: ${successes}, Failures: ${failures}`);
}
test();
