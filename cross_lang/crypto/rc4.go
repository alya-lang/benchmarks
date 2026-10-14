package main

import "fmt"

func main() {
	key := []byte("SecretAlyaKey2026")
	keyLen := len(key)
	var s [256]byte
	for k := 0; k < 256; k++ {
		s[k] = byte(k)
	}
	j := 0
	for i := 0; i < 256; i++ {
		j = (j + int(s[i]) + int(key[i%keyLen])) % 256
		s[i], s[j] = s[j], s[i]
	}
	i := 0
	j = 0
	var checksum int64
	n := 100000
	for step := 0; step < n; step++ {
		i = (i + 1) % 256
		j = (j + int(s[i])) % 256
		s[i], s[j] = s[j], s[i]
		streamByte := s[(int(s[i])+int(s[j]))%256]
		dataByte := byte((step * 31) % 256)
		checksum += int64(dataByte ^ streamByte)
	}
	fmt.Println(checksum)
}
