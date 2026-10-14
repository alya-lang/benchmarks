const std = @import("std");

fn collatzLen(n: i64) i64 {
    var steps: i64 = 0;
    var cur = n;
    while (cur > 1) {
        if (@mod(cur, 2) == 0) {
            cur = @divTrunc(cur, 2);
        } else {
            cur = 3 * cur + 1;
        }
        steps += 1;
    }
    return steps;
}

pub fn main() void {
    var max_len: i64 = 0;
    var i: i64 = 1;
    while (i < 100000) : (i += 1) {
        const len = collatzLen(i);
        if (len > max_len) max_len = len;
    }
    std.debug.print("{d}\n", .{max_len});
}
