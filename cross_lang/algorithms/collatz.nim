proc collatzLen(n: int64): int64 =
  var cur = n
  while cur > 1:
    if cur mod 2 == 0:
      cur = cur div 2
    else:
      cur = 3 * cur + 1
    inc result

var maxLen: int64 = 0
for i in 1 ..< 100000:
  let l = collatzLen(i)
  if l > maxLen: maxLen = l
echo maxLen
