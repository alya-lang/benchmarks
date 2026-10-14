package main

import "fmt"

type TreeNode struct {
	left, right *TreeNode
	item        int64
}

func makeTree(item int64, depth int) *TreeNode {
	node := &TreeNode{item: item}
	if depth != 0 {
		node.left = makeTree(2*item-1, depth-1)
		node.right = makeTree(2*item, depth-1)
	}
	return node
}

func checkTree(node *TreeNode) int64 {
	if node.left == nil {
		return node.item
	}
	return node.item + checkTree(node.left) - checkTree(node.right)
}

func main() {
	maxDepth := 14
	stretch := makeTree(0, maxDepth+1)
	total := checkTree(stretch)
	longLived := makeTree(0, maxDepth)
	for depth := 4; depth <= maxDepth; depth += 2 {
		iterations := 1 << (maxDepth - depth + 4)
		var check int64
		for i := 1; i <= iterations; i++ {
			t1 := makeTree(int64(i), depth)
			t2 := makeTree(int64(-i), depth)
			check += checkTree(t1) + checkTree(t2)
		}
		total += check
	}
	total += checkTree(longLived)
	fmt.Println(total)
}
