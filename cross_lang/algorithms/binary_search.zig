const std = @import("std");

fn binarySearch(arr: []i64, n: i64, target: i64) i64 {
    var low: i64 = 0;
    var high: i64 = n - 1;
    while (low <= high) {
        const mid = @divTrunc(low + high, 2);
        const val = arr[@as(usize, @intCast(mid))];
        if (val == target) {
            return mid;
        } else if (val < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}

pub fn main() !void {
    const n: i64 = 100000;
    const arr = try std.heap.page_allocator.alloc(i64, @as(usize, @intCast(n)));
    defer std.heap.page_allocator.free(arr);
    for (arr, 0..) |*v, i| v.* = @as(i64, @intCast(i)) * 2;
    var idx_sum: i64 = 0;
    var q: i64 = 0;
    while (q < 50000) : (q += 1) {
        const target = @mod(q * 3, 200000);
        const res = binarySearch(arr, n, target);
        if (res >= 0) idx_sum += res;
    }
    std.debug.print("{d}\n", .{idx_sum});
}
