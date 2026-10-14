package main

import "fmt"

func main() {
	var totalIn int64
	var seed int64 = 42
	var n int64 = 500000
	for i := int64(0); i < n; i++ {
		seed = (seed*60001 + 12345) % 32768
		if seed < 0 {
			seed = -seed
		}
		x := seed
		seed = (seed*60001 + 12345) % 32768
		if seed < 0 {
			seed = -seed
		}
		y := seed
		if x*x+y*y <= 1073741824 {
			totalIn++
		}
	}
	fmt.Println(totalIn)
}
