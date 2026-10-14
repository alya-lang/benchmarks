proc partition(arr: var seq[int], lo, hi: int): int =
  let pivot = arr[hi]
  var i = lo - 1
  for j in lo ..< hi:
    if arr[j] <= pivot:
      inc i
      swap(arr[i], arr[j])
  swap(arr[i+1], arr[hi])
  i + 1

proc quicksort(arr: var seq[int], lo, hi: int) =
  if lo < hi:
    let pi = partition(arr, lo, hi)
    quicksort(arr, lo, pi-1)
    quicksort(arr, pi+1, hi)

var arr = newSeq[int](50000)
var seed: int64 = 42
for i in 0 ..< 50000:
  seed = (seed * 2121 + 12347) mod 1000000
  if seed < 0: seed = -seed
  arr[i] = seed.int
quicksort(arr, 0, 49999)
echo arr[0].int64 + arr[25000].int64 + arr[49999].int64
