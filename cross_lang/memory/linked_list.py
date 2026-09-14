class ListNode:
    __slots__ = ('val', 'next')
    def __init__(self, val, next):
        self.val = val
        self.next = next

def main():
    count = 50000
    head = None
    for i in range(count):
        head = ListNode(i, head)

    s = 0
    cur = head
    while cur is not None:
        s += cur.val
        cur = cur.next
    print(s)

if __name__ == "__main__":
    main()
