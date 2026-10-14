package main

import "fmt"

func main() {
	var totalBits int64
	var seed int64 = 42
	var n int64 = 100000
	for i := int64(0); i < n; i++ {
		seed = (seed*1103515245 + 12345) & 0x7FFFFFFF
		x := seed
		var count int64
		for x > 0 {
			x = x & (x - 1)
			count++
		}
		totalBits += count
	}
	fmt.Println(totalBits)
}
