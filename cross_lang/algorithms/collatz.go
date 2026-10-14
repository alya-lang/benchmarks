package main

import "fmt"

func collatzLen(n int64) int64 {
	var steps int64
	cur := n
	for cur > 1 {
		if cur%2 == 0 {
			cur = cur / 2
		} else {
			cur = 3*cur + 1
		}
		steps++
	}
	return steps
}

func main() {
	var maxLen int64
	var limit int64 = 100000
	for i := int64(1); i < limit; i++ {
		if l := collatzLen(i); l > maxLen {
			maxLen = l
		}
	}
	fmt.Println(maxLen)
}
