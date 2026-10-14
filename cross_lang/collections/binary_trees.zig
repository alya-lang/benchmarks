const std = @import("std");

const TreeNode = struct {
    left: ?*TreeNode = null,
    right: ?*TreeNode = null,
    item: i64 = 0,
};

fn makeTree(item: i64, depth: i32) !*TreeNode {
    const node = try std.heap.page_allocator.create(TreeNode);
    node.* = .{ .item = item };
    if (depth != 0) {
        node.left = try makeTree(2 * item - 1, depth - 1);
        node.right = try makeTree(2 * item, depth - 1);
    }
    return node;
}

fn checkTree(node: *TreeNode) i64 {
    if (node.left == null) return node.item;
    return node.item + checkTree(node.left.?) - checkTree(node.right.?);
}

fn freeTree(node: ?*TreeNode) void {
    if (node) |n| {
        freeTree(n.left);
        freeTree(n.right);
        std.heap.page_allocator.destroy(n);
    }
}

pub fn main() !void {
    const max_depth: i32 = 14;
    const stretch = try makeTree(0, max_depth + 1);
    var total = checkTree(stretch);
    freeTree(stretch);
    const long_lived = try makeTree(0, max_depth);
    var depth: i32 = 4;
    while (depth <= max_depth) : (depth += 2) {
        const iterations: usize = @as(usize, 1) << @as(u5, @intCast(max_depth - depth + 4));
        var check: i64 = 0;
        var i: usize = 1;
        while (i <= iterations) : (i += 1) {
            const t1 = try makeTree(@as(i64, @intCast(i)), depth);
            const t2 = try makeTree(-@as(i64, @intCast(i)), depth);
            check += checkTree(t1) + checkTree(t2);
            freeTree(t1);
            freeTree(t2);
        }
        total += check;
    }
    total += checkTree(long_lived);
    freeTree(long_lived);
    std.debug.print("{d}\n", .{total});
}
