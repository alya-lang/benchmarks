proc countPrimes(limit: int64): int64 =
  var flags = newSeq[int64](limit + 1)
  for i in 0 .. limit: flags[i] = 1
  var p: int64 = 2
  while p * p <= limit:
    if flags[p] == 1:
      var m = p * p
      while m <= limit:
        flags[m] = 0
        m += p
    inc p
  for j in 2 .. limit:
    if flags[j] == 1: inc result

echo countPrimes(50000)
