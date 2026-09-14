const key = Buffer.from("SecretAlyaKey2026");
const keyLen = key.length;

const s = new Uint8Array(256);
for (let k = 0; k < 256; k++) {
    s[k] = k;
}

let j = 0;
for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % keyLen]) % 256;
    const tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
}

let i = 0;
j = 0;
let checksum = 0;
const n = 100000;
for (let step = 0; step < n; step++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    const tmp2 = s[i];
    s[i] = s[j];
    s[j] = tmp2;
    const streamByte = s[(s[i] + s[j]) % 256];
    const dataByte = (step * 31) % 256;
    const cipherByte = dataByte ^ streamByte;
    checksum += cipherByte;
}

console.log(checksum);
