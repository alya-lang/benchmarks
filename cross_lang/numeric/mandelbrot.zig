const std = @import("std");

fn mandelbrotPoint(cr: f64, ci: f64, max_iter: i32) i32 {
    var zr: f64 = 0.0;
    var zi: f64 = 0.0;
    var iter: i32 = 0;
    while (iter < max_iter) {
        const zr2 = zr * zr;
        const zi2 = zi * zi;
        if (zr2 + zi2 > 4.0) return iter;
        zi = 2.0 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        iter += 1;
    }
    return max_iter;
}

pub fn main() void {
    const width: i32 = 200;
    const height: i32 = 100;
    const max_iter: i32 = 200;
    var total: i64 = 0;
    var y: i32 = 0;
    while (y < height) : (y += 1) {
        const ci: f64 = -1.5 + (3.0 * @as(f64, @floatFromInt(y))) / @as(f64, @floatFromInt(height));
        var x: i32 = 0;
        while (x < width) : (x += 1) {
            const cr: f64 = -2.0 + (3.0 * @as(f64, @floatFromInt(x))) / @as(f64, @floatFromInt(width));
            total += mandelbrotPoint(cr, ci, max_iter);
        }
    }
    std.debug.print("{d}\n", .{total});
}
