const std = @import("std");

pub fn main() !void {
    const key = "SecretAlyaKey2026";
    var s: [256]u8 = undefined;
    for (&s, 0..) |*b, k| b.* = @intCast(k);
    var j: usize = 0;
    for (0..256) |i| {
        j = (j + @as(usize, s[i]) + @as(usize, key[i % key.len])) % 256;
        const tmp = s[i];
        s[i] = s[j];
        s[j] = tmp;
    }
    var i: usize = 0;
    j = 0;
    var checksum: i64 = 0;
    for (0..100000) |step| {
        i = (i + 1) % 256;
        j = (j + @as(usize, s[i])) % 256;
        const tmp = s[i];
        s[i] = s[j];
        s[j] = tmp;
        // Full-width sum before the mod: `(s[i] +% s[j]) % 256` does
        // not compile (256 is unrepresentable in u8).
        const sij: usize = @as(usize, s[i]) + @as(usize, s[j]);
        const stream_byte = s[sij % 256];
        const data_byte: u8 = @intCast((step * 31) % 256);
        checksum += data_byte ^ stream_byte;
    }
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{d}\n", .{checksum});
}
