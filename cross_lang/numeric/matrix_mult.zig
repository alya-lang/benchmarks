const std = @import("std");

pub fn main() !void {
    const n: usize = 120;
    const a = try std.heap.page_allocator.alloc(i32, n * n);
    defer std.heap.page_allocator.free(a);
    const b = try std.heap.page_allocator.alloc(i32, n * n);
    defer std.heap.page_allocator.free(b);
    const c = try std.heap.page_allocator.alloc(i32, n * n);
    defer std.heap.page_allocator.free(c);
    for (0..n) |i| {
        for (0..n) |j| {
            a[i * n + j] = @intCast(@mod(@as(i64, @intCast(i)) * 3 + @as(i64, @intCast(j)), 10));
            b[i * n + j] = @intCast(@mod(@as(i64, @intCast(i)) * 7 + @as(i64, @intCast(j)), 10));
            c[i * n + j] = 0;
        }
    }
    for (0..n) |i| {
        for (0..n) |j| {
            var sum: i32 = 0;
            for (0..n) |k| {
                sum += a[i * n + k] * b[k * n + j];
            }
            c[i * n + j] = sum;
        }
    }
    var total: i64 = 0;
    for (c) |v| total += v;
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{d}\n", .{total});
}
