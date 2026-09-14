def main():
    total_bits = 0
    seed = 42
    n = 100000

    for _ in range(n):
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        x = seed
        count = 0
        while x > 0:
            x = x & (x - 1)
            count += 1
        total_bits += count

    print(total_bits)

if __name__ == "__main__":
    main()
