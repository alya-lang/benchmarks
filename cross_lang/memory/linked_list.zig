const std = @import("std");

const ListNode = struct {
    val: i64,
    next: ?*ListNode,
};

pub fn main() !void {
    var head: ?*ListNode = null;
    var i: i64 = 0;
    while (i < 50000) : (i += 1) {
        const node = try std.heap.page_allocator.create(ListNode);
        node.* = .{ .val = i, .next = head };
        head = node;
    }
    var sum: i64 = 0;
    var cur = head;
    while (cur) |n| {
        sum += n.val;
        const tmp = n;
        cur = n.next;
        std.heap.page_allocator.destroy(tmp);
    }
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{d}\n", .{sum});
}
