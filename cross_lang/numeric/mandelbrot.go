package main

import "fmt"

func mandelbrotPoint(cr, ci float64, maxIter int) int {
	zr, zi := 0.0, 0.0
	iter := 0
	for iter < maxIter {
		zr2 := zr * zr
		zi2 := zi * zi
		if zr2+zi2 > 4.0 {
			return iter
		}
		zi = 2.0*zr*zi + ci
		zr = zr2 - zi2 + cr
		iter++
	}
	return maxIter
}

func main() {
	width, height, maxIter := 200, 100, 200
	var total int64
	for y := 0; y < height; y++ {
		ci := -1.5 + (3.0*float64(y))/float64(height)
		for x := 0; x < width; x++ {
			cr := -2.0 + (3.0*float64(x))/float64(width)
			total += int64(mandelbrotPoint(cr, ci, maxIter))
		}
	}
	fmt.Println(total)
}
