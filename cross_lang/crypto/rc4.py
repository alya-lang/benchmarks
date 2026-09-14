def main():
    key = b"SecretAlyaKey2026"
    key_len = len(key)

    s = list(range(256))
    j = 0
    for i in range(256):
        j = (j + s[i] + key[i % key_len]) % 256
        s[i], s[j] = s[j], s[i]

    i = 0
    j = 0
    checksum = 0
    n = 100000
    for step in range(n):
        i = (i + 1) % 256
        j = (j + s[i]) % 256
        s[i], s[j] = s[j], s[i]
        stream_byte = s[(s[i] + s[j]) % 256]
        data_byte = (step * 31) % 256
        cipher_byte = data_byte ^ stream_byte
        checksum += cipher_byte

    print(checksum)

if __name__ == "__main__":
    main()
