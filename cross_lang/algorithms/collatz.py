def collatz_len(n: int) -> int:
    steps = 0
    cur = n
    while cur > 1:
        if cur % 2 == 0:
            cur = cur // 2
        else:
            cur = 3 * cur + 1
        steps += 1
    return steps

def main():
    max_len = 0
    limit = 100000
    for i in range(1, limit):
        l = collatz_len(i)
        if l > max_len:
            max_len = l
    print(max_len)

if __name__ == "__main__":
    main()
