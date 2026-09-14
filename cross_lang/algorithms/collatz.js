function collatzLen(n) {
    let steps = 0;
    let cur = n;
    while (cur > 1) {
        if (cur % 2 === 0) {
            cur = Math.floor(cur / 2);
        } else {
            cur = 3 * cur + 1;
        }
        steps++;
    }
    return steps;
}

let maxLen = 0;
const limit = 100000;
for (let i = 1; i < limit; i++) {
    const len = collatzLen(i);
    if (len > maxLen) {
        maxLen = len;
    }
}
console.log(maxLen);
