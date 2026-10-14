var totalIn: int64 = 0
var seed: int64 = 42
for i in 0 ..< 500000:
  seed = (seed * 60001 + 12345) mod 32768
  if seed < 0: seed = -seed
  let x = seed
  seed = (seed * 60001 + 12345) mod 32768
  if seed < 0: seed = -seed
  let y = seed
  if x * x + y * y <= 1073741824: inc totalIn
echo totalIn
