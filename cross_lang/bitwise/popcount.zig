const std = @import("std");

pub fn main() !void {
    var total_bits: i64 = 0;
    var seed: i64 = 42;
    var i: i64 = 0;
    while (i < 100000) : (i += 1) {
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
        var x = seed;
        var count: i64 = 0;
        while (x > 0) {
            x = x & (x - 1);
            count += 1;
        }
        total_bits += count;
    }
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{d}\n", .{total_bits});
}
