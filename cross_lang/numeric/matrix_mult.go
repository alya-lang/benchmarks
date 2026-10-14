package main

import "fmt"

func main() {
	n := 120
	a := make([]int, n*n)
	b := make([]int, n*n)
	c := make([]int, n*n)
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			a[i*n+j] = (i*3 + j) % 10
			b[i*n+j] = (i*7 + j) % 10
		}
	}
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			sum := 0
			for k := 0; k < n; k++ {
				sum += a[i*n+k] * b[k*n+j]
			}
			c[i*n+j] = sum
		}
	}
	total := 0
	for _, v := range c {
		total += v
	}
	fmt.Println(total)
}
