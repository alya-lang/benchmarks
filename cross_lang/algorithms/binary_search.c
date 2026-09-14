#include <stdio.h>
#include <stdlib.h>

long long binary_search(const long long *arr, long long n, long long target) {
    long long low = 0;
    long long high = n - 1;
    while (low <= high) {
        long long mid = (low + high) / 2;
        long long val = arr[mid];
        if (val == target) {
            return mid;
        } else if (val < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}

int main() {
    long long n = 100000;
    long long *arr = (long long *)malloc(n * sizeof(long long));
    if (!arr) return 1;

    for (long long i = 0; i < n; i++) {
        arr[i] = i * 2;
    }

    long long idx_sum = 0;
    long long queries = 50000;
    for (long long q = 0; q < queries; q++) {
        long long target = (q * 3) % 200000;
        long long res = binary_search(arr, n, target);
        if (res >= 0) {
            idx_sum += res;
        }
    }

    printf("%lld\n", idx_sum);
    free(arr);
    return 0;
}
