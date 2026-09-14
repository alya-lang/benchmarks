let totalBits = 0;
let seed = 42;
const n = 100000;

for (let i = 0; i < n; i++) {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7FFFFFFF;
    let x = seed;
    let count = 0;
    while (x > 0) {
        x = x & (x - 1);
        count++;
    }
    totalBits += count;
}

console.log(totalBits);
