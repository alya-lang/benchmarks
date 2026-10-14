import strformat

const TableSize = 65536
const Mask = 65535

type Entry = object
  key: string
  val: int
  occupied: bool

proc djb2(s: string): uint32 =
  # Plain int64 arithmetic with an explicit mod: values stay small
  # (h < 2^32 throughout), so no wraparound semantics are needed.
  var h: int64 = 5381
  for c in s:
    h = (h * 33 + ord(c)) mod 4294967296
  h.uint32

proc mapSet(table: var seq[Entry], key: string, val: int) =
  var idx = (djb2(key) and Mask.uint32).int
  while table[idx].occupied:
    if table[idx].key == key:
      table[idx].val = val
      return
    idx = (idx + 1) and Mask
  table[idx] = Entry(key: key, val: val, occupied: true)

proc mapGet(table: seq[Entry], key: string): int =
  var idx = (djb2(key) and Mask.uint32).int
  while table[idx].occupied:
    if table[idx].key == key:
      return table[idx].val
    idx = (idx + 1) and Mask
  0

var table = newSeq[Entry](TableSize)
for i in 0 ..< 20000:
  mapSet(table, fmt"key_{i}", i*3)
for i in 0 ..< 20000:
  if i mod 2 == 0:
    mapSet(table, fmt"key_{i}", i*5)
var sum = 0
for i in 0 ..< 20000:
  sum += mapGet(table, fmt"key_{i}")
echo sum
