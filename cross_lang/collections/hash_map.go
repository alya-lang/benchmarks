package main

import "fmt"

const tableSize = 65536
const mask = tableSize - 1

type entry struct {
	key      string
	val      int
	occupied bool
}

func djb2(s string) uint32 {
	hash := uint32(5381)
	for i := 0; i < len(s); i++ {
		hash = hash*33 + uint32(s[i])
	}
	return hash
}

func mapSet(table []entry, key string, val int) {
	idx := djb2(key) & mask
	for table[idx].occupied {
		if table[idx].key == key {
			table[idx].val = val
			return
		}
		idx = (idx + 1) & mask
	}
	table[idx].occupied = true
	table[idx].key = key
	table[idx].val = val
}

func mapGet(table []entry, key string) int {
	idx := djb2(key) & mask
	for table[idx].occupied {
		if table[idx].key == key {
			return table[idx].val
		}
		idx = (idx + 1) & mask
	}
	return 0
}

func main() {
	table := make([]entry, tableSize)
	n := 20000
	for i := 0; i < n; i++ {
		mapSet(table, fmt.Sprintf("key_%d", i), i*3)
	}
	for i := 0; i < n; i++ {
		if i%2 == 0 {
			mapSet(table, fmt.Sprintf("key_%d", i), i*5)
		}
	}
	sum := 0
	for i := 0; i < n; i++ {
		sum += mapGet(table, fmt.Sprintf("key_%d", i))
	}
	fmt.Println(sum)
}
