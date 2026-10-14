proc binarySearch(arr: seq[int64], n, target: int64): int64 =
  var low: int64 = 0
  var high = n - 1
  while low <= high:
    let mid = (low + high) div 2
    let val = arr[mid]
    if val == target: return mid
    elif val < target: low = mid + 1
    else: high = mid - 1
  -1

const n: int64 = 100000
var arr = newSeq[int64](n)
for i in 0 ..< n: arr[i] = i * 2
var idxSum: int64 = 0
for q in 0 ..< 50000:
  let target = (q * 3) mod 200000
  let res = binarySearch(arr, n, target)
  if res >= 0: idxSum += res
echo idxSum
