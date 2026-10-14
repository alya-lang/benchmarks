package main

import "fmt"

func countPrimes(limit int64) int64 {
	flags := make([]int64, limit+1)
	for i := int64(0); i <= limit; i++ {
		flags[i] = 1
	}
	for p := int64(2); p*p <= limit; p++ {
		if flags[p] == 1 {
			for m := p * p; m <= limit; m += p {
				flags[m] = 0
			}
		}
	}
	var count int64
	for j := int64(2); j <= limit; j++ {
		if flags[j] == 1 {
			count++
		}
	}
	return count
}

func main() {
	fmt.Println(countPrimes(50000))
}
