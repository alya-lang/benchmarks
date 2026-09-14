class ListNode {
    constructor(val, next) {
        this.val = val;
        this.next = next;
    }
}

const count = 50000;
let head = null;
for (let i = 0; i < count; i++) {
    head = new ListNode(i, head);
}

let sum = 0;
let cur = head;
while (cur !== null) {
    sum += cur.val;
    cur = cur.next;
}
console.log(sum);
