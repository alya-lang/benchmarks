package main

import "fmt"

func fnv1a(s string) int64 {
	h := int64(2166136261)
	for i := 0; i < len(s); i++ {
		c := int64(s[i])
		h ^= c
		h = (h * 16777619) & 0x7FFFFFFF
	}
	return h
}

func main() {
	sample := "The quick brown fox jumps over the lazy dog! Alya is fast and modern."
	var h int64
	for i := 0; i < 50000; i++ {
		h = fnv1a(sample)
	}
	fmt.Println(h)
}
