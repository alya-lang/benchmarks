const std = @import("std");

pub fn main() !void {
    var total_in: i64 = 0;
    var seed: i64 = 42;
    var i: i64 = 0;
    while (i < 500000) : (i += 1) {
        seed = @mod(seed * 60001 + 12345, 32768);
        if (seed < 0) seed = -seed;
        const x = seed;
        seed = @mod(seed * 60001 + 12345, 32768);
        if (seed < 0) seed = -seed;
        const y = seed;
        if (x * x + y * y <= 1073741824) total_in += 1;
    }
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{d}\n", .{total_in});
}
