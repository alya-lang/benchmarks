proc fnv1a(s: string): int64 =
  var h: int64 = 2166136261
  for c in s:
    h = h xor ord(c).int64
    h = (h * 16777619) and 0x7FFFFFFF
  h

const sample = "The quick brown fox jumps over the lazy dog! Alya is fast and modern."
var h: int64 = 0
for i in 0 ..< 50000:
  h = fnv1a(sample)
echo h
