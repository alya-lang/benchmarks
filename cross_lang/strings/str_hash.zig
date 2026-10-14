const std = @import("std");

fn fnv1a(s: []const u8) i64 {
    var h: i64 = 2166136261;
    for (s) |c| {
        h ^= c;
        h = (h *% 16777619) & 0x7FFFFFFF;
    }
    return h;
}

pub fn main() !void {
    const sample = "The quick brown fox jumps over the lazy dog! Alya is fast and modern.";
    var h: i64 = 0;
    var i: i32 = 0;
    while (i < 50000) : (i += 1) {
        h = fnv1a(sample);
    }
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{d}\n", .{h});
}
