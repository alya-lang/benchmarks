proc mandelbrotPoint(cr, ci: float64, maxIter: int): int =
  var zr = 0.0
  var zi = 0.0
  var iter = 0
  while iter < maxIter:
    let zr2 = zr * zr
    let zi2 = zi * zi
    if zr2 + zi2 > 4.0: return iter
    zi = 2.0 * zr * zi + ci
    zr = zr2 - zi2 + cr
    inc iter
  maxIter

var total: int64 = 0
for y in 0 ..< 100:
  let ci = -1.5 + (3.0 * y.float64) / 100.0
  for x in 0 ..< 200:
    let cr = -2.0 + (3.0 * x.float64) / 200.0
    total += mandelbrotPoint(cr, ci, 200).int64
echo total
