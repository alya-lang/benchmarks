def binary_search(arr, n: int, target: int) -> int:
    low = 0
    high = n - 1
    while low <= high:
        mid = (low + high) // 2
        val = arr[mid]
        if val == target:
            return mid
        elif val < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

def main():
    n = 100000
    arr = [i * 2 for i in range(n)]

    idx_sum = 0
    queries = 50000
    for q in range(queries):
        target = (q * 3) % 200000
        res = binary_search(arr, n, target)
        if res >= 0:
            idx_sum += res

    print(idx_sum)

if __name__ == "__main__":
    main()
