#include <stdio.h>

int main() {
    long long total_in = 0;
    long long seed = 42;
    long long n = 500000;
    for (long long i = 0; i < n; i++) {
        seed = (seed * 1103515245 + 12345) % 32768;
        if (seed < 0) seed = -seed;
        long long x = seed;

        seed = (seed * 1103515245 + 12345) % 32768;
        if (seed < 0) seed = -seed;
        long long y = seed;

        if (x * x + y * y <= 1073741824) {
            total_in++;
        }
    }

    printf("%lld\n", total_in);
    return 0;
}
