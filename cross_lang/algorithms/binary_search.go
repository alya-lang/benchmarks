package main

import "fmt"

func binarySearch(arr []int64, n, target int64) int64 {
	low, high := int64(0), n-1
	for low <= high {
		mid := (low + high) / 2
		val := arr[mid]
		if val == target {
			return mid
		} else if val < target {
			low = mid + 1
		} else {
			high = mid - 1
		}
	}
	return -1
}

func main() {
	var n int64 = 100000
	arr := make([]int64, n)
	for i := int64(0); i < n; i++ {
		arr[i] = i * 2
	}
	var idxSum int64
	var queries int64 = 50000
	for q := int64(0); q < queries; q++ {
		target := (q * 3) % 200000
		if res := binarySearch(arr, n, target); res >= 0 {
			idxSum += res
		}
	}
	fmt.Println(idxSum)
}
