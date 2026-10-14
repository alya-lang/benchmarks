var totalBits: int64 = 0
var seed: int64 = 42
for i in 0 ..< 100000:
  seed = (seed * 1103515245 + 12345) and 0x7FFFFFFF
  var x = seed
  var count: int64 = 0
  while x > 0:
    x = x and (x - 1)
    inc count
  totalBits += count
echo totalBits
