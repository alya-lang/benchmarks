const n = 120
var a = newSeq[int](n*n)
var b = newSeq[int](n*n)
var c = newSeq[int](n*n)
for i in 0 ..< n:
  for j in 0 ..< n:
    a[i*n+j] = (i*3 + j) mod 10
    b[i*n+j] = (i*7 + j) mod 10
for i in 0 ..< n:
  for j in 0 ..< n:
    var sum = 0
    for k in 0 ..< n:
      sum += a[i*n+k] * b[k*n+j]
    c[i*n+j] = sum
var total = 0
for v in c: total += v
echo total
