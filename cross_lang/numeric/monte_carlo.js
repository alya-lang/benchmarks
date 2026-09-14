let totalIn = 0;
let seed = 42;
const n = 500000;

for (let i = 0; i < n; i++) {
    seed = (seed * 1103515245 + 12345) % 32768;
    if (seed < 0) seed = -seed;
    const x = seed;

    seed = (seed * 1103515245 + 12345) % 32768;
    if (seed < 0) seed = -seed;
    const y = seed;

    if (x * x + y * y <= 1073741824) {
        totalIn++;
    }
}

console.log(totalIn);
