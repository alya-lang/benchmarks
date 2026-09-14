#include <stdio.h>

int main() {
    long long total_bits = 0;
    long long seed = 42;
    long long n = 100000;
    for (long long i = 0; i < n; i++) {
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
        long long x = seed;
        long long count = 0;
        while (x > 0) {
            x = x & (x - 1);
            count++;
        }
        total_bits += count;
    }

    printf("%lld\n", total_bits);
    return 0;
}
