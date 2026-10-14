const std = @import("std");

fn partition(arr: []i32, low: isize, high: isize) usize {
    const pivot = arr[@as(usize, @intCast(high))];
    var i: isize = low - 1;
    var j: isize = low;
    while (j < high) : (j += 1) {
        if (arr[@as(usize, @intCast(j))] <= pivot) {
            i += 1;
            const tmp = arr[@as(usize, @intCast(i))];
            arr[@as(usize, @intCast(i))] = arr[@as(usize, @intCast(j))];
            arr[@as(usize, @intCast(j))] = tmp;
        }
    }
    const t = arr[@as(usize, @intCast(i + 1))];
    arr[@as(usize, @intCast(i + 1))] = arr[@as(usize, @intCast(high))];
    arr[@as(usize, @intCast(high))] = t;
    return @as(usize, @intCast(i + 1));
}

fn quicksort(arr: []i32, low: isize, high: isize) void {
    if (low < high) {
        const pi: isize = @intCast(partition(arr, low, high));
        quicksort(arr, low, pi - 1);
        quicksort(arr, pi + 1, high);
    }
}

pub fn main() !void {
    const n: usize = 50000;
    const arr = try std.heap.page_allocator.alloc(i32, n);
    defer std.heap.page_allocator.free(arr);
    var seed: i64 = 42;
    for (arr) |*v| {
        seed = @mod(seed * 2121 + 12347, 1000000);
        if (seed < 0) seed = -seed;
        v.* = @intCast(seed);
    }
    quicksort(arr, 0, @intCast(n - 1));
    const sum: i64 = arr[0] + arr[25000] + arr[n - 1];
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{d}\n", .{sum});
}
