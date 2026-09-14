def main():
    total_in = 0
    seed = 42
    n = 500000

    for _ in range(n):
        seed = (seed * 1103515245 + 12345) % 32768
        if seed < 0:
            seed = -seed
        x = seed

        seed = (seed * 1103515245 + 12345) % 32768
        if seed < 0:
            seed = -seed
        y = seed

        if x * x + y * y <= 1073741824:
            total_in += 1

    print(total_in)

if __name__ == "__main__":
    main()
