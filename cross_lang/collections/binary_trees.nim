type TreeNode = ref object
  left, right: TreeNode
  item: int64

proc makeTree(item: int64, depth: int): TreeNode =
  result = TreeNode(item: item)
  if depth != 0:
    result.left = makeTree(2*item-1, depth-1)
    result.right = makeTree(2*item, depth-1)

proc checkTree(node: TreeNode): int64 =
  if node.left == nil: return node.item
  node.item + checkTree(node.left) - checkTree(node.right)

const maxDepth = 14
let stretch = makeTree(0, maxDepth+1)
var total = checkTree(stretch)
let longLived = makeTree(0, maxDepth)
for depth in countup(4, maxDepth, 2):
  let iterations = 1 shl (maxDepth - depth + 4)
  var check: int64 = 0
  for i in 1 .. iterations:
    let t1 = makeTree(i, depth)
    let t2 = makeTree(-i, depth)
    check += checkTree(t1) + checkTree(t2)
  total += check
total += checkTree(longLived)
echo total
