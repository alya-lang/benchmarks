const std = @import("std");

pub fn main() !void {
    const limit: usize = 50000;
    const flags = try std.heap.page_allocator.alloc(i64, limit + 1);
    defer std.heap.page_allocator.free(flags);
    for (flags) |*f| f.* = 1;
    var p: usize = 2;
    while (p * p <= limit) : (p += 1) {
        if (flags[p] == 1) {
            var m: usize = p * p;
            while (m <= limit) : (m += p) {
                flags[m] = 0;
            }
        }
    }
    var count: i64 = 0;
    for (flags[2..]) |f| {
        if (f == 1) count += 1;
    }
    std.debug.print("{d}\n", .{count});
}
