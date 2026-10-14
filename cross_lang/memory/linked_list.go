package main

import "fmt"

type ListNode struct {
	val  int64
	next *ListNode
}

func main() {
	var count int64 = 50000
	var head *ListNode
	for i := int64(0); i < count; i++ {
		head = &ListNode{val: i, next: head}
	}
	var sum int64
	for cur := head; cur != nil; cur = cur.next {
		sum += cur.val
	}
	fmt.Println(sum)
}
