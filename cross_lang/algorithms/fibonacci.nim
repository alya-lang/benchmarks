proc fib(n: int64): int64 =
  if n <= 1: return n
  fib(n-1) + fib(n-2)

echo fib(30)
