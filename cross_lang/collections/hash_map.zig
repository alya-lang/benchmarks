const std = @import("std");

const TableSize: usize = 65536;
const Mask: usize = TableSize - 1;

const Entry = struct {
    key: [32]u8 = [_]u8{0} ** 32,
    key_len: usize = 0,
    val: i32 = 0,
    occupied: bool = false,
};

fn djb2(s: []const u8) u32 {
    var hash: u32 = 5381;
    for (s) |c| {
        hash = hash *% 33 +% c;
    }
    return hash;
}

fn mapSet(table: []Entry, key: []const u8, val: i32) void {
    var idx: usize = djb2(key) & Mask;
    while (table[idx].occupied) {
        if (table[idx].key_len == key.len and std.mem.eql(u8, table[idx].key[0..table[idx].key_len], key)) {
            table[idx].val = val;
            return;
        }
        idx = (idx + 1) & Mask;
    }
    @memcpy(table[idx].key[0..key.len], key);
    table[idx].key_len = key.len;
    table[idx].val = val;
    table[idx].occupied = true;
}

fn mapGet(table: []Entry, key: []const u8) i32 {
    var idx: usize = djb2(key) & Mask;
    while (table[idx].occupied) {
        if (table[idx].key_len == key.len and std.mem.eql(u8, table[idx].key[0..table[idx].key_len], key)) {
            return table[idx].val;
        }
        idx = (idx + 1) & Mask;
    }
    return 0;
}

pub fn main() !void {
    const table = try std.heap.page_allocator.alloc(Entry, TableSize);
    defer std.heap.page_allocator.free(table);
    for (table) |*e| e.* = .{};
    var buf: [32]u8 = undefined;
    var i: i32 = 0;
    while (i < 20000) : (i += 1) {
        const key = try std.fmt.bufPrint(&buf, "key_{d}", .{i});
        mapSet(table, key, i * 3);
    }
    i = 0;
    while (i < 20000) : (i += 1) {
        if (@mod(i, 2) == 0) {
            const key = try std.fmt.bufPrint(&buf, "key_{d}", .{i});
            mapSet(table, key, i * 5);
        }
    }
    var sum: i64 = 0;
    i = 0;
    while (i < 20000) : (i += 1) {
        const key = try std.fmt.bufPrint(&buf, "key_{d}", .{i});
        sum += mapGet(table, key);
    }
    std.debug.print("{d}\n", .{sum});
}
