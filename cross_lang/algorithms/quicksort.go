package main

import "fmt"

func partition(arr []int, low, high int) int {
	pivot := arr[high]
	i := low - 1
	for j := low; j < high; j++ {
		if arr[j] <= pivot {
			i++
			arr[i], arr[j] = arr[j], arr[i]
		}
	}
	arr[i+1], arr[high] = arr[high], arr[i+1]
	return i + 1
}

func quicksort(arr []int, low, high int) {
	if low < high {
		pi := partition(arr, low, high)
		quicksort(arr, low, pi-1)
		quicksort(arr, pi+1, high)
	}
}

func main() {
	n := 50000
	arr := make([]int, n)
	var seed int64 = 42
	for i := 0; i < n; i++ {
		seed = (seed*2121 + 12347) % 1000000
		if seed < 0 {
			seed = -seed
		}
		arr[i] = int(seed)
	}
	quicksort(arr, 0, n-1)
	fmt.Println(int64(arr[0]) + int64(arr[25000]) + int64(arr[n-1]))
}
