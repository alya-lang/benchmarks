function binarySearch(arr, n, target) {
    let low = 0;
    let high = n - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const val = arr[mid];
        if (val === target) {
            return mid;
        } else if (val < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}

const n = 100000;
const arr = new Int32Array(n);
for (let i = 0; i < n; i++) {
    arr[i] = i * 2;
}

let idxSum = 0;
const queries = 50000;
for (let q = 0; q < queries; q++) {
    const target = (q * 3) % 200000;
    const res = binarySearch(arr, n, target);
    if (res >= 0) {
        idxSum += res;
    }
}

console.log(idxSum);
