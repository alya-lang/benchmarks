#include <stdio.h>

int main() {
    unsigned char key[] = "SecretAlyaKey2026";
    int key_len = sizeof(key) - 1;

    unsigned char s[256];
    for (int k = 0; k < 256; k++) {
        s[k] = (unsigned char)k;
    }

    int j = 0;
    for (int i = 0; i < 256; i++) {
        j = (j + s[i] + key[i % key_len]) % 256;
        unsigned char tmp = s[i];
        s[i] = s[j];
        s[j] = tmp;
    }

    int i = 0;
    j = 0;
    long long checksum = 0;
    int n = 100000;
    for (int step = 0; step < n; step++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        unsigned char tmp2 = s[i];
        s[i] = s[j];
        s[j] = tmp2;
        unsigned char stream_byte = s[(s[i] + s[j]) % 256];
        unsigned char data_byte = (step * 31) % 256;
        unsigned char cipher_byte = data_byte ^ stream_byte;
        checksum += cipher_byte;
    }

    printf("%lld\n", checksum);
    return 0;
}
