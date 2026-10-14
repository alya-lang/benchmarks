type ListNode = ref object
  val: int64
  next: ListNode

var head: ListNode = nil
for i in 0 ..< 50000:
  let node = ListNode(val: i, next: head)
  head = node
var sum: int64 = 0
var cur = head
while cur != nil:
  sum += cur.val
  cur = cur.next
echo sum
