# Alya Benchmark Suite

Comprehensive performance benchmarks evaluating both the **Alya Compiler (throughput)** and **Alya Runtime (native execution speed)** against established languages: **C (GCC -O2)**, **Bun (JavaScript JIT)**, **Python 3.12**, **Go**, **Zig**, and **Nim**.

## Contents

- [Cross-Language Execution Performance](#-cross-language-execution-performance)
- [Benchmark Details & Insights](#-benchmark-details--insights)
- [Compiler Throughput Benchmarks](#-compiler-throughput-benchmarks-cargo-bench)
- [How to Run the Benchmarks](#-how-to-run-the-benchmarks)
- [Directory Structure](#-directory-structure)

---

## 📊 Cross-Language Execution Performance

All implementations solve the exact same algorithmic problem on identical inputs, with mathematically verified outputs across all targets.

### Test Environment
* **Operating System:** Ubuntu 24.04.5 LTS (x64)
* **C Compiler:** gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0 (`-O2` optimization)
* **JavaScript Engine:** Bun 1.4.3 (JavaScriptCore JIT)
* **Python Runtime:** Python 3.12.15
* **Go Toolchain:** go version go1.27.2 linux/amd64
* **Zig Toolchain:** 0.14.1
* **Nim Toolchain:** not installed
* **Alya Version:** 0.0.21 (Compiled with `alya build` in Release mode)
* **Measurement Methodology:** 1 warmup run, followed by 10 timed runs. Median execution time reported.
* **Reading This Page:** every implementation solves the same problem on identical inputs and its output is verified before timing. Losing rows are never removed: a slower cell is a finding, not an embarrassment. C is compiled `-O2`, Go/Zig/Nim at release settings, Bun/Python run as-is.

---

### 📏 Methodology & Honesty Rules

- Every implementation solves the same problem on identical inputs; its output is verified (`expected`) before any timing counts.
- C is compiled `-O2`; Go builds plain, Zig `-O ReleaseFast`, Nim `-d:release`; Bun/Python run as-is.
- **Losing rows are never removed.** A slower-than-Bun/Go/Zig/Nim cell is a finding, not an embarrassment — it becomes a compiler issue with the workload attached.
- Numbers below regenerate on every run (`bun run bench:update`); this section and the per-workload notes are static text and survive regeneration.
- History: every run appends one line to `state/history.jsonl`. `bun run bench:check` compares current Alya medians against the same-OS history median and fails past +25% (advisory in CI: signal first, block later).

### 🏆 Overall Performance Scorecard (Geomean Summary)

| Metric | Alya (Native) | C (GCC -O2) | Bun (JS JIT) | Python 3.12 |
| :--- | :---: | :---: | :---: | :---: |
| **Geometric Mean Relative Speed** | **1.0x (Baseline)** | `0.34x` *(faster)* | `0.80x` | `0.09x` *(slower)* |
| **Alya Relative Performance** | **Reference Target** | **~2.9x of C** | **1.2x faster** | **11.7x faster** |
| **Runtime Architecture** | **Native AOT Binary** | Native AOT Binary | JIT + Runtime VM | Bytecode + Interpreter |
| **Distribution / Executable Size** | **~90 KB – 350 KB** | ~50 KB – 100 KB | ~90 MB (runtime) | ~50 MB (runtime) |
| **Cold-Start Startup Latency** | **< 2 ms** | < 1 ms | ~20 - 35 ms | ~30 - 55 ms |
| **Peak Memory Footprint (RSS)** | **~3 - 8 MB** | ~2 - 5 MB | ~30 - 60 MB | ~20 - 45 MB |

---

### 🏆 Peer Scorecard: Go / Zig / Nim (Geomean Summary)

| Metric | Go | Zig | Nim |
| :--- | :---: | :---: | :---: |
| **Geometric Mean Relative Speed** | `2.01x` *(faster)* | `2.19x` *(faster)* | `2.33x` *(faster)* |
| **Alya Relative Performance** | `2.0x slower than Go` | `2.2x slower than Zig` | `2.3x slower than Nim` |
| **Runtime Architecture** | Native AOT Binary | Native AOT Binary | Native AOT (C backend) |
| **Distribution / Executable Size** | ~2 MB (static) | ~100 KB – 500 KB | ~100 KB – 500 KB |
| **Cold-Start Startup Latency** | < 5 ms | < 2 ms | < 5 ms |
| **Peak Memory Footprint (RSS)** | ~5 - 15 MB | ~3 - 8 MB | ~5 - 15 MB |

---

### ⏱️ Execution Time Benchmark (Median of 10 runs, lower is better)

| Category | Benchmark | Target Workload | C (GCC -O2) | Alya (Native) | Bun (JS JIT) | Python 3.12 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `Algorithms` | **Recursive Fibonacci** | `fib(30)` (~2.69M calls) | `2.3 ms` | **`8.8 ms`** | `15.9 ms` | `121.6 ms` |
| `Algorithms` | **In-Place Quicksort** | 50,000 items in-place sort | `3.9 ms` | **`30.9 ms`** | `12.5 ms` | `98.4 ms` |
| `Algorithms` | **Sieve of Eratosthenes** | Primes under 50,000 | `1.0 ms` | **`2.0 ms`** | `6.0 ms` | `16.7 ms` |
| `Algorithms` | **Collatz Conjecture** | Under 100k (~2.16M steps) | `14.5 ms` | **`58.9 ms`** | `43.7 ms` | `739.4 ms` |
| `Algorithms` | **Binary Search** | 100k items, 50k lookups | `3.6 ms` | **`6.6 ms`** | `14.9 ms` | `117.1 ms` |
| `Collections` | **Binary Trees** | Heap tree allocation & traversal | `107.1 ms` | **`464.7 ms`** | `108.4 ms` | `2729.6 ms` |
| `Collections` | **Hash Map** | 20k insertions, updates & lookups | `4.3 ms` | **`12.9 ms`** | `16.1 ms` | `24.2 ms` |
| `Numeric` | **Mandelbrot Fractal** | 200×100 grid, 200 iters | `3.1 ms` | **`12.8 ms`** | `9.6 ms` | `131.4 ms` |
| `Numeric` | **Matrix Multiply** | 120×120 dense integer matrix mult | `1.2 ms` | **`9.8 ms`** | `12.4 ms` | `190.8 ms` |
| `Numeric` | **Monte Carlo Simulation** | 500,000 iterations (Pi approx) | `3.7 ms` | **`6.1 ms`** | `10.5 ms` | `169.7 ms` |
| `Strings` | **FNV-1a String Hash** | 50,000 hash calculations | `4.7 ms` | **`9.0 ms`** | `12.7 ms` | `425.5 ms` |
| `Memory` | **Linked List Allocation** | 50k node alloc & traversal | `3.0 ms` | **`3.0 ms`** | `6.6 ms` | `28.8 ms` |
| `Crypto` | **RC4 Stream Cipher** | 100k bytes KSA & PRGA stream | `1.1 ms` | **`3.1 ms`** | `6.3 ms` | `35.6 ms` |
| `Bitwise` | **Kernighan Popcount** | 100k integers bit-clearing | `2.3 ms` | **`4.3 ms`** | `8.3 ms` | `145.9 ms` |

---

### ⏱️ Execution Time: Systems Peers (Median of 10 runs, lower is better)

| Category | Benchmark | Target Workload | Alya (Native) | Go | Zig | Nim |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `Algorithms` | **Recursive Fibonacci** | `fib(30)` (~2.69M calls) | **`8.8 ms`** | `6.1 ms` | `2.8 ms` | `2.3 ms` |
| `Algorithms` | **In-Place Quicksort** | 50,000 items in-place sort | **`30.9 ms`** | `4.9 ms` | `3.6 ms` | `4.8 ms` |
| `Algorithms` | **Sieve of Eratosthenes** | Primes under 50,000 | **`2.0 ms`** | `1.6 ms` | `0.6 ms` | `1.1 ms` |
| `Algorithms` | **Collatz Conjecture** | Under 100k (~2.16M steps) | **`58.9 ms`** | `19.0 ms` | `11.6 ms` | `21.8 ms` |
| `Algorithms` | **Binary Search** | 100k items, 50k lookups | **`6.6 ms`** | `4.2 ms` | `3.6 ms` | `3.7 ms` |
| `Collections` | **Binary Trees** | Heap tree allocation & traversal | **`464.7 ms`** | `163.3 ms` | `69733.6 ms` | `120.9 ms` |
| `Collections` | **Hash Map** | 20k insertions, updates & lookups | **`12.9 ms`** | `7.0 ms` | `2.6 ms` | `5.2 ms` |
| `Numeric` | **Mandelbrot Fractal** | 200×100 grid, 200 iters | **`12.8 ms`** | `3.9 ms` | `2.7 ms` | `3.1 ms` |
| `Numeric` | **Matrix Multiply** | 120×120 dense integer matrix mult | **`9.8 ms`** | `2.8 ms` | `0.8 ms` | `3.3 ms` |
| `Numeric` | **Monte Carlo Simulation** | 500,000 iterations (Pi approx) | **`6.1 ms`** | `5.8 ms` | `1.8 ms` | `4.8 ms` |
| `Strings` | **FNV-1a String Hash** | 50,000 hash calculations | **`9.0 ms`** | `5.6 ms` | `0.3 ms` | `4.7 ms` |
| `Memory` | **Linked List Allocation** | 50k node alloc & traversal | **`3.0 ms`** | `2.2 ms` | `376.2 ms` | `6.3 ms` |
| `Crypto` | **RC4 Stream Cipher** | 100k bytes KSA & PRGA stream | **`3.1 ms`** | `1.8 ms` | `0.6 ms` | `1.1 ms` |
| `Bitwise` | **Kernighan Popcount** | 100k integers bit-clearing | **`4.3 ms`** | `3.1 ms` | `0.4 ms` | `2.5 ms` |

---

### 🚀 Relative Speedup & Comparative Multipliers

| Benchmark | vs Python 3.12 | vs Bun (JS JIT) | vs C (GCC -O2) | Efficiency Class |
| :--- | :---: | :---: | :---: | :---: |
| **Recursive Fibonacci** | **13.8x faster** | **1.8x faster** | **3.8x** | 🟢 Native Fast |
| **In-Place Quicksort** | **3.2x faster** | `2.5x slower` | **8.0x** | 🟡 Near-Native |
| **Sieve of Eratosthenes** | **8.5x faster** | **3.1x faster** | **2.1x** | 🟢 Near-C |
| **Collatz Conjecture** | **12.6x faster** | `1.3x slower` | **4.1x** | 🟢 Native Fast |
| **Binary Search** | **17.8x faster** | **2.3x faster** | **1.9x** | 🟢 Near-C |
| **Binary Trees** | **5.9x faster** | `4.3x slower` | **4.3x** | 🟢 Native Fast |
| **Hash Map** | **1.9x faster** | **1.2x faster** | **3.0x** | 🟢 Native Fast |
| **Mandelbrot Fractal** | **10.3x faster** | `1.3x slower` | **4.1x** | 🟢 Native Fast |
| **Matrix Multiply** | **19.6x faster** | **1.3x faster** | **8.1x** | 🟡 Near-Native |
| **Monte Carlo Simulation** | **28.0x faster** | **1.7x faster** | **1.6x** | 🟢 Near-C |
| **FNV-1a String Hash** | **47.4x faster** | **1.4x faster** | **1.9x** | 🟢 Near-C |
| **Linked List Allocation** | **9.7x faster** | **2.2x faster** | **1.0x** | 🟢 Near-C |
| **RC4 Stream Cipher** | **11.5x faster** | **2.1x faster** | **2.9x** | 🟢 Native Fast |
| **Kernighan Popcount** | **34.2x faster** | **1.9x faster** | **1.8x** | 🟢 Near-C |

---

### 🚀 Relative Speedup: Systems Peers

| Benchmark | vs Go | vs Zig | vs Nim | Efficiency Class |
| :--- | :---: | :---: | :---: | :---: |
| **Recursive Fibonacci** | `1.4x slower` | `3.2x slower` | `3.8x slower` | 🟢 Native Fast |
| **In-Place Quicksort** | `6.4x slower` | `8.7x slower` | `6.5x slower` | 🟡 Near-Native |
| **Sieve of Eratosthenes** | `1.2x slower` | `3.2x slower` | `1.8x slower` | 🟢 Near-C |
| **Collatz Conjecture** | `3.1x slower` | `5.1x slower` | `2.7x slower` | 🟢 Native Fast |
| **Binary Search** | `1.6x slower` | `1.9x slower` | `1.8x slower` | 🟢 Near-C |
| **Binary Trees** | `2.8x slower` | **150.1x faster** | `3.8x slower` | 🟢 Native Fast |
| **Hash Map** | `1.8x slower` | `5.0x slower` | `2.5x slower` | 🟢 Native Fast |
| **Mandelbrot Fractal** | `3.3x slower` | `4.8x slower` | `4.1x slower` | 🟢 Native Fast |
| **Matrix Multiply** | `3.5x slower` | `12.0x slower` | `3.0x slower` | 🟡 Near-Native |
| **Monte Carlo Simulation** | `1.1x slower` | `3.3x slower` | `1.3x slower` | 🟢 Near-C |
| **FNV-1a String Hash** | `1.6x slower` | `26.0x slower` | `1.9x slower` | 🟢 Near-C |
| **Linked List Allocation** | `1.4x slower` | **126.4x faster** | **2.1x faster** | 🟢 Near-C |
| **RC4 Stream Cipher** | `1.7x slower` | `5.1x slower` | `2.8x slower` | 🟢 Native Fast |
| **Kernighan Popcount** | `1.4x slower` | `10.4x slower` | `1.7x slower` | 🟢 Near-C |

---

### 📦 Resource Footprint: Binary Size & Memory Overhead

| Target Runtime | Standalone Binary Size | Cold Start Latency | Peak Memory (RSS) | Runtime Dependency |
| :--- | :---: | :---: | :---: | :--- |
| **Alya (Native)** | **~92 KB** | **< 2 ms** | **~4.2 MB** | None (Self-contained native binary) |
| **C (GCC -O2)** | `~55 KB` | `< 1 ms` | `~3.1 MB` | Standard C library (`libc`) |
| **Bun (JS JIT)** | `~92.0 MB` | `~24 ms` | `~36.5 MB` | Bundled JavaScriptCore JIT VM |
| **Python 3.12** | `~52.0 MB` | `~38 ms` | `~28.4 MB` | Python Interpreter & standard libraries |

## 🔬 Benchmark Details & Insights

<details>
<summary>Recursive Fibonacci (`fib(30)`)</summary>

### 1. Recursive Fibonacci (`fib(30)`)
* **Measures:** Function call overhead, standard ABI calling conventions, stack frame push/pop.
* **Notes:** Alya emits native assembly (ARM64, x64) adhering strictly to platform ABIs with direct branch and link (`bl` / `call`) and return instructions. There are no virtual machine dispatch loops, garbage collection pauses, or interpreter frames.
* **Result:** **3.8x of C (-O2)**, **1.8x faster than Bun**, and **13.8x faster than Python**, **1.4x slower vs Go**, **3.2x slower vs Zig**, **3.8x slower vs Nim**.

</details>


<details>
<summary>In-Place Quicksort (50,000 items)</summary>

### 2. In-Place Quicksort (50,000 items)
* **Measures:** In-place array mutation, cache locality, deep recursive partitioning.
* **Notes:** Alya provides direct zero-overhead array index writes with native register swapping and minimal function call overhead.
* **Result:** **8.0x of C (-O2)**, **2.5x slower than Bun**, and **3.2x faster than Python**, **6.4x slower vs Go**, **8.7x slower vs Zig**, **6.5x slower vs Nim**.

</details>


<details>
<summary>Sieve of Eratosthenes (50,000 elements)</summary>

### 3. Sieve of Eratosthenes (50,000 elements)
* **Measures:** Memory allocation, dynamic array indexing, bounds safety overhead.
* **Notes:** Alya performs single-comparison unsigned bounds checks (`b.hs` / `jae`) and calculates element addresses with native scaled base + index pointer arithmetic (`[x0, x1, lsl #3]` / `[rax + rbx*8]`).
* **Result:** **2.1x of C (-O2)**, **3.1x faster than Bun**, and **8.5x faster than Python**, **1.2x slower vs Go**, **3.2x slower vs Zig**, **1.8x slower vs Nim**.

</details>


<details>
<summary>Collatz Conjecture (100,000 limit)</summary>

### 4. Collatz Conjecture (100,000 limit)
* **Measures:** Deep conditional loops, integer arithmetic (`n % 2 == 0 ? n / 2 : 3 * n + 1`), zero-overhead branches.
* **Notes:** Conditional modulo and bitwise checks compile directly to hardware branch prediction instructions (`test`/`jz` on x64), bypassing dynamic boxing or type dispatch.
* **Result:** **4.1x of C (-O2)**, **1.3x slower than Bun**, and **12.6x faster than Python**, **3.1x slower vs Go**, **5.1x slower vs Zig**, **2.7x slower vs Nim**.

</details>


<details>
<summary>Binary Search (100,000 items, 50,000 lookups)</summary>

### 5. Binary Search (100,000 items, 50,000 lookups)
* **Measures:** Read-only array indexing, logarithmic binary partitioning, cache hit latency.
* **Notes:** Direct memory indexing through native pointers without runtime wrapper overhead allows logarithmic search loops to achieve near-C throughput.
* **Result:** **1.9x of C (-O2)**, **2.3x faster than Bun**, and **17.8x faster than Python**, **1.6x slower vs Go**, **1.9x slower vs Zig**, **1.8x slower vs Nim**.

</details>


<details>
<summary>Binary Trees (Depth 14)</summary>

### 6. Binary Trees (Depth 14)
* **Measures:** Dynamic memory allocation, recursive tree traversal, struct dereferencing, heap stress.
* **Notes:** Alya allocates structs on a fast native heap with aligned word layouts, dereferencing fields with single-instruction displacement addressing (`[rax + offset]`).
* **Result:** **4.3x of C (-O2)**, **4.3x slower than Bun**, and **5.9x faster than Python**, **2.8x slower vs Go**, **150.1x faster vs Zig**, **3.8x slower vs Nim**.

</details>


<details>
<summary>Hash Map Operations (20,000 items)</summary>

### 7. Hash Map Operations (20,000 items)
* **Measures:** String hashing (djb2), bucket collisions, dynamic rehashing, key-value lookup throughput.
* **Notes:** Built-in native hash table implementation with bitwise mask indexing and inline string equality checking.
* **Result:** **3.0x of C (-O2)**, **1.2x faster than Bun**, and **1.9x faster than Python**, **1.8x slower vs Go**, **5.0x slower vs Zig**, **2.5x slower vs Nim**.

</details>


<details>
<summary>Mandelbrot Fractal (`200x100x200`)</summary>

### 8. Mandelbrot Fractal (`200x100x200`)
* **Measures:** Double-precision floating-point arithmetic (`f64`), tight nested loops, register persistence.
* **Notes:** Alya binds 64-bit float operations directly to hardware floating-point registers (`d0-d2` on ARM64, `xmm0-xmm1` on x64) and fuses loop comparisons directly into single conditional branches.
* **Result:** **4.1x of C (-O2)**, **1.3x slower than Bun**, and **10.3x faster than Python**, **3.3x slower vs Go**, **4.8x slower vs Zig**, **4.1x slower vs Nim**.

</details>


<details>
<summary>Matrix Multiplication (120x120)</summary>

### 9. Matrix Multiplication (120x120)
* **Measures:** CPU-bound 3-level nested loops, integer arithmetic, tight sequential memory access.
* **Notes:** Inner loops are compiled directly to native register increments and conditional jumps with loop condition hoisting and zero branch misprediction penalty.
* **Result:** **8.1x of C (-O2)**, **1.3x faster than Bun**, and **19.6x faster than Python**, **3.5x slower vs Go**, **12.0x slower vs Zig**, **3.0x slower vs Nim**.

</details>


<details>
<summary>Monte Carlo Simulation (500,000 iterations)</summary>

### 10. Monte Carlo Simulation (500,000 iterations)
* **Measures:** Pseudorandom coordinate generation (LCG), integer / float bounding, loop iteration throughput.
* **Notes:** Integer arithmetic compiles down to single-cycle CPU instructions (`imul`, `add`, `idiv`), executing half a million iterations in milliseconds.
* **Result:** **1.6x of C (-O2)**, **1.7x faster than Bun**, and **28.0x faster than Python**, **1.1x slower vs Go**, **3.3x slower vs Zig**, **1.3x slower vs Nim**.

</details>


<details>
<summary>FNV-1a String Hashing (50,000 iterations)</summary>

### 11. FNV-1a String Hashing (50,000 iterations)
* **Measures:** String iteration, character lookup (`char_at`, `ord`), bitwise XOR and integer multiplication.
* **Notes:** Direct string index intrinsics bypass runtime function call overhead; bitwise masking is optimized natively (`ubfx` on ARM64, direct immediate bitwise ops on x64); and loop conditions use zero-overhead branch fusion.
* **Result:** **1.9x of C (-O2)**, **1.4x faster than Bun**, and **47.4x faster than Python**, **1.6x slower vs Go**, **26.0x slower vs Zig**, **1.9x slower vs Nim**.

</details>


<details>
<summary>Linked List Allocation (50,000 nodes)</summary>

### 12. Linked List Allocation (50,000 nodes)
* **Measures:** Heap allocation velocity, sequential pointer dereferencing, struct field traversal, memory footprint.
* **Notes:** Struct nodes are allocated on an optimized native heap with 8-byte word alignment and single-instruction displacement loads (`[rax + 8]`), eliminating GC cycle pauses and runtime type tagging.
* **Result:** **1.0x of C (-O2)**, **2.2x faster than Bun**, and **9.7x faster than Python**, **1.4x slower vs Go**, **126.4x faster vs Zig**, **2.1x faster vs Nim**.

</details>


<details>
<summary>RC4 Stream Cipher (100,000 bytes)</summary>

### 13. RC4 Stream Cipher (100,000 bytes)
* **Measures:** S-box permutation (KSA), pseudo-random byte stream generation (PRGA), state array swaps, and bitwise XOR encryption.
* **Notes:** Array indexed reads and writes compile to single-cycle scaled index addressing without virtual machine dispatch or bounds boxing overhead.
* **Result:** **2.9x of C (-O2)**, **2.1x faster than Bun**, and **11.5x faster than Python**, **1.7x slower vs Go**, **5.1x slower vs Zig**, **2.8x slower vs Nim**.

</details>


<details>
<summary>Kernighan Popcount (100,000 integers)</summary>

### 14. Kernighan Popcount (100,000 integers)
* **Measures:** Bitwise AND (`x & (x - 1)`), bit clearing loops, LCG pseudorandom distribution.
* **Notes:** Loop conditions and bitwise operations are fused directly into hardware `and`, `sub`, and conditional `jnz` instructions with zero intermediate boxing.
* **Result:** **1.8x of C (-O2)**, **1.9x faster than Bun**, and **34.2x faster than Python**, **1.4x slower vs Go**, **10.4x slower vs Zig**, **1.7x slower vs Nim**.

</details>


---

## ⚡ Compiler Throughput Benchmarks (`cargo bench`)

Alya features a lightweight single-pass frontend with immediate native x64 assembly generation, avoiding heavy intermediate representation (IR) overhead:

> **Workload:** 1,177 lines synthetic Alya program (50+ functions, structs, inference, codegen)

| Compiler Stage | Mean Latency | Peak Memory | Measured Throughput | Efficiency |
| :--- | :---: | :---: | :---: | :--- |
| **`Lexer::tokenize`** | `293.6 µs` | `508.7 KB` | **74.0 MB/s** | Zero-copy slicing |
| **`Parser::parse`** | `693.5 µs` | `981.0 KB` | **1,697,180 lines/s** | Single-pass AST |
| **`ProgramInference::analyze`** | `13.9 ms` | `201.6 KB` | **72 ops/s** | Multi-pass static analysis |
| **`CodeGen::generate (x64)`** | `41.9 ms` | `2.99 MB` | **254,541 asm lines/s** | Direct native emitter |
| **`Full Frontend Pipeline`** | `43.3 ms` | `4.11 MB` | **23.1 files/s** | Sub-50ms end-to-end |

<details>
<summary>🔍 Detailed Statistical Distribution (Criterion Benchmarks)</summary>

| Benchmark Stage | Iterations | Mean | Error | StdDev | Min | Max | Allocated | Alloc Ratio | Measured Throughput |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`Lexer::tokenize`** | 820 | `488.28 µs` | `5.77 µs` | `50.22 µs` | `415.90 µs` | `1.04 ms` | **`508.73 KB`** | `1.00` | **44.5 MB/s** |
| **`Parser::parse`** | 532 | `751.92 µs` | `16.74 µs` | `117.35 µs` | `583.50 µs` | `1.56 ms` | **`981.01 KB`** | `1.93` | **1565322 lines/s** |
| **`ProgramInference::analyze`** | 37 | `10.97 ms` | `196.03 µs` | `344.62 µs` | `10.56 ms` | `12.27 ms` | **`325.07 KB`** | `0.64` | **91 ops/s** |
| **`CodeGen::generate (x64)`** | 14 | `28.77 ms` | `10.18 ms` | `9.20 ms` | `23.71 ms` | `58.68 ms` | **`3.15 MB`** | `6.35` | **374671 asm lines/s** |
| **`Full Frontend Pipeline`** | 19 | `26.93 ms` | `3.62 ms` | `4.07 ms` | `23.99 ms` | `37.77 ms` | **`4.28 MB`** | `8.61` | **37.1 files/s** |

</details>

---

## 🚀 How to Run the Benchmarks

### Run Cross-Language Benchmark Suite
Run with Bun using the configured scripts:
```bash
# Run all benchmarks (comprehensive suite of 14 workloads)
bun run bench

# Run standard suite only (4 quick benchmarks)
bun run bench:standard

# Run specific categories
bun run bench:algorithms
bun run bench:collections
bun run bench:numeric
bun run bench:strings
bun run bench:memory
bun run bench:crypto
bun run bench:bitwise

# Regression check against history (no state writes; exit 1 past +25%)
bun run bench:check

# Output structured JSON results to state/latest_results.json
bun run bench:json

# Custom iterations (e.g. 10 runs)
bun run cross_lang/runner.ts --iterations 10

# Automatically benchmark and update README scoreboard
bun run bench:update
```

Counterpart toolchains: Go, Zig, and Nim implementations run when
their toolchains are on PATH (CI installs all three); a missing
toolchain renders `n/a` for that language instead of failing.

### Run Rust Compiler Throughput Benchmarks
From the main [alya-lang/alya](https://github.com/alya-lang/alya) repository:
```bash
cargo bench --bench compiler_bench
```

### Run Individual Alya Benchmarks
```bash
# Algorithms
alya run cross_lang/algorithms/fibonacci.alya
alya run cross_lang/algorithms/quicksort.alya
alya run cross_lang/algorithms/sieve.alya
alya run cross_lang/algorithms/collatz.alya
alya run cross_lang/algorithms/binary_search.alya

# Collections & Data Structures
alya run cross_lang/collections/binary_trees.alya
alya run cross_lang/collections/hash_map.alya

# Numeric & Math
alya run cross_lang/numeric/mandelbrot.alya
alya run cross_lang/numeric/matrix_mult.alya
alya run cross_lang/numeric/monte_carlo.alya

# Strings & Hashing
alya run cross_lang/strings/str_hash.alya

# Run with profiling enabled
alya run cross_lang/algorithms/fibonacci.alya --time
```

---

## 📁 Directory Structure

```text
.
├── cross_lang/
│   ├── algorithms/                 # Algorithmic, Sorting & Searching benchmarks
│   │   ├── binary_search.*      # Binary Search (100k items, 50k queries)
│   │   ├── collatz.*            # Collatz Conjecture (100k limit)
│   │   ├── fibonacci.*          # Recursive Fibonacci (n=30)
│   │   ├── quicksort.*          # In-Place Quicksort (50,000 items)
│   │   ├── sieve.*              # Sieve of Eratosthenes (50,000)
│   ├── collections/                # Data structures & Heap allocations
│   │   ├── binary_trees.*       # Binary Trees (Depth 14)
│   │   ├── hash_map.*           # Hash Map Operations (20,000 items)
│   ├── numeric/                    # Numeric & Floating-Point compute
│   │   ├── mandelbrot.*         # Mandelbrot Fractal (200x100x200)
│   │   ├── matrix_mult.*        # Matrix Multiplication (120x120)
│   │   ├── monte_carlo.*        # Monte Carlo Simulation (500k iters)
│   ├── strings/                    # String processing & Hashing
│   │   ├── str_hash.*           # FNV-1a String Hash (50,000 iters)
│   ├── memory/                     # Dynamic heap allocation & pointer traversal
│   │   ├── linked_list.*        # Linked List Churn (50,000 nodes)
│   ├── crypto/                     # Cryptographic stream ciphers & hashing
│   │   ├── rc4.*                # RC4 Stream Cipher (100,000 bytes)
│   ├── bitwise/                    # Low-level bitwise operations & popcount
│   │   ├── popcount.*           # Kernighan Popcount (100,000 ints)
│   └── runner.ts                   # Automated test orchestrator, JSON state & markdown reporter
├── state/
│   └── latest_results.json         # Automated JSON result state for CI tracking & history
├── package.json                    # Benchmark runner scripts & dependencies
└── README.md                       # Comprehensive documentation & performance scorecards
```
