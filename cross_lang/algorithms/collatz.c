#include <stdio.h>

long long collatz_len(long long n) {
    long long steps = 0;
    long long cur = n;
    while (cur > 1) {
        if (cur % 2 == 0) {
            cur = cur / 2;
        } else {
            cur = 3 * cur + 1;
        }
        steps++;
    }
    return steps;
}

int main() {
    long long max_len = 0;
    long long limit = 100000;
    for (long long i = 1; i < limit; i++) {
        long long len = collatz_len(i);
        if (len > max_len) {
            max_len = len;
        }
    }
    printf("%lld\n", max_len);
    return 0;
}
