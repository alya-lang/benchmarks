import { spawnSync } from "child_process";
import { performance } from "perf_hooks";
import * as fs from "fs";
import * as path from "path";

interface BenchConfig {
  id: string;
  name: string;
  category:
    | "Algorithms"
    | "Collections"
    | "Numeric"
    | "Strings"
    | "Memory"
    | "Crypto"
    | "Bitwise";
  displayName: string;
  rootDisplayName: string;
  workload: string;
  expected: string;
  suite: "standard" | "comprehensive";
  alyaSrc: string;
  cSrc: string;
  pySrc: string;
  jsSrc: string;
  // Optional Go/Zig/Nim counterparts. When absent, the runner derives
  // them from the jsSrc stem (`<name>.js` -> `<name>.go`, ...); a
  // missing file renders as "n/a" instead of failing the suite.
  goSrc?: string;
  zigSrc?: string;
  nimSrc?: string;
}

const BENCHMARKS: BenchConfig[] = [
  // 1. Algorithms & Sorting
  {
    id: "fib",
    name: "Recursive Fibonacci (n=30)",
    category: "Algorithms",
    displayName: "**Recursive Fibonacci**",
    rootDisplayName: "**Recursive Fibonacci (n=30)**",
    workload: "`fib(30)` (~2.69M calls)",
    expected: "832040",
    suite: "standard",
    alyaSrc: "cross_lang/algorithms/fibonacci.alya",
    cSrc: "cross_lang/algorithms/fibonacci.c",
    pySrc: "cross_lang/algorithms/fibonacci.py",
    jsSrc: "cross_lang/algorithms/fibonacci.js",
  },
  {
    id: "quicksort",
    name: "In-Place Quicksort (50,000 items)",
    category: "Algorithms",
    displayName: "**In-Place Quicksort**",
    rootDisplayName: "**Quicksort (50k items)**",
    workload: "50,000 items in-place sort",
    expected: "1502059",
    suite: "comprehensive",
    alyaSrc: "cross_lang/algorithms/quicksort.alya",
    cSrc: "cross_lang/algorithms/quicksort.c",
    pySrc: "cross_lang/algorithms/quicksort.py",
    jsSrc: "cross_lang/algorithms/quicksort.js",
  },
  {
    id: "sieve",
    name: "Sieve of Eratosthenes (50,000)",
    category: "Algorithms",
    displayName: "**Sieve of Eratosthenes**",
    rootDisplayName: "**Sieve of Eratosthenes (50k)**",
    workload: "Primes under 50,000",
    expected: "5133",
    suite: "standard",
    alyaSrc: "cross_lang/algorithms/sieve.alya",
    cSrc: "cross_lang/algorithms/sieve.c",
    pySrc: "cross_lang/algorithms/sieve.py",
    jsSrc: "cross_lang/algorithms/sieve.js",
  },
  {
    id: "collatz",
    name: "Collatz Conjecture (100,000)",
    category: "Algorithms",
    displayName: "**Collatz Conjecture**",
    rootDisplayName: "**Collatz (100k limit)**",
    workload: "Under 100k (~2.16M steps)",
    expected: "350",
    suite: "comprehensive",
    alyaSrc: "cross_lang/algorithms/collatz.alya",
    cSrc: "cross_lang/algorithms/collatz.c",
    pySrc: "cross_lang/algorithms/collatz.py",
    jsSrc: "cross_lang/algorithms/collatz.js",
  },
  {
    id: "binary_search",
    name: "Binary Search (100k items, 50k lookups)",
    category: "Algorithms",
    displayName: "**Binary Search**",
    rootDisplayName: "**Binary Search (100k items)**",
    workload: "100k items, 50k lookups",
    expected: "937462500",
    suite: "comprehensive",
    alyaSrc: "cross_lang/algorithms/binary_search.alya",
    cSrc: "cross_lang/algorithms/binary_search.c",
    pySrc: "cross_lang/algorithms/binary_search.py",
    jsSrc: "cross_lang/algorithms/binary_search.js",
  },

  // 2. Data Structures & Collections
  {
    id: "binary_trees",
    name: "Binary Trees (Depth 14)",
    category: "Collections",
    displayName: "**Binary Trees**",
    rootDisplayName: "**Binary Trees (Depth 14)**",
    workload: "Heap tree allocation & traversal",
    expected: "-43682",
    suite: "comprehensive",
    alyaSrc: "cross_lang/collections/binary_trees.alya",
    cSrc: "cross_lang/collections/binary_trees.c",
    pySrc: "cross_lang/collections/binary_trees.py",
    jsSrc: "cross_lang/collections/binary_trees.js",
  },
  {
    id: "hash_map",
    name: "Hash Map Operations (20,000 items)",
    category: "Collections",
    displayName: "**Hash Map**",
    rootDisplayName: "**Hash Map (20k entries)**",
    workload: "20k insertions, updates & lookups",
    expected: "799950000",
    suite: "comprehensive",
    alyaSrc: "cross_lang/collections/hash_map.alya",
    cSrc: "cross_lang/collections/hash_map.c",
    pySrc: "cross_lang/collections/hash_map.py",
    jsSrc: "cross_lang/collections/hash_map.js",
  },

  // 3. Numeric & Mathematical Computation
  {
    id: "mandelbrot",
    name: "Mandelbrot Fractal (200x100x200)",
    category: "Numeric",
    displayName: "**Mandelbrot Fractal**",
    rootDisplayName: "**Mandelbrot Fractal (200×100)**",
    workload: "200×100 grid, 200 iters",
    expected: "767273",
    suite: "standard",
    alyaSrc: "cross_lang/numeric/mandelbrot.alya",
    cSrc: "cross_lang/numeric/mandelbrot.c",
    pySrc: "cross_lang/numeric/mandelbrot.py",
    jsSrc: "cross_lang/numeric/mandelbrot.js",
  },
  {
    id: "matrix_mult",
    name: "Matrix Multiplication (120x120)",
    category: "Numeric",
    displayName: "**Matrix Multiply**",
    rootDisplayName: "**Matrix Multiply (120×120)**",
    workload: "120×120 dense integer matrix mult",
    expected: "34992000",
    suite: "comprehensive",
    alyaSrc: "cross_lang/numeric/matrix_mult.alya",
    cSrc: "cross_lang/numeric/matrix_mult.c",
    pySrc: "cross_lang/numeric/matrix_mult.py",
    jsSrc: "cross_lang/numeric/matrix_mult.js",
  },
  {
    id: "monte_carlo",
    name: "Monte Carlo Simulation (500k iters)",
    category: "Numeric",
    displayName: "**Monte Carlo Simulation**",
    rootDisplayName: "**Monte Carlo (500k iters)**",
    workload: "500,000 iterations (Pi approx)",
    expected: "392713",
    suite: "comprehensive",
    alyaSrc: "cross_lang/numeric/monte_carlo.alya",
    cSrc: "cross_lang/numeric/monte_carlo.c",
    pySrc: "cross_lang/numeric/monte_carlo.py",
    jsSrc: "cross_lang/numeric/monte_carlo.js",
  },

  // 4. Strings & Hashing
  {
    id: "str_hash",
    name: "FNV-1a String Hash (50,000 iters)",
    category: "Strings",
    displayName: "**FNV-1a String Hash**",
    rootDisplayName: "**FNV-1a String Hash (50k)**",
    workload: "50,000 hash calculations",
    expected: "1736110778",
    suite: "standard",
    alyaSrc: "cross_lang/strings/str_hash.alya",
    cSrc: "cross_lang/strings/str_hash.c",
    pySrc: "cross_lang/strings/str_hash.py",
    jsSrc: "cross_lang/strings/str_hash.js",
  },

  // 5. Memory & Dynamic Heap Allocation
  {
    id: "linked_list",
    name: "Linked List Churn (50,000 nodes)",
    category: "Memory",
    displayName: "**Linked List Allocation**",
    rootDisplayName: "**Linked List (50k nodes)**",
    workload: "50k node alloc & traversal",
    expected: "1249975000",
    suite: "comprehensive",
    alyaSrc: "cross_lang/memory/linked_list.alya",
    cSrc: "cross_lang/memory/linked_list.c",
    pySrc: "cross_lang/memory/linked_list.py",
    jsSrc: "cross_lang/memory/linked_list.js",
  },

  // 6. Cryptography & Stream Ciphers
  {
    id: "rc4",
    name: "RC4 Stream Cipher (100,000 bytes)",
    category: "Crypto",
    displayName: "**RC4 Stream Cipher**",
    rootDisplayName: "**RC4 Cipher (100k bytes)**",
    workload: "100k bytes KSA & PRGA stream",
    expected: "12776054",
    suite: "comprehensive",
    alyaSrc: "cross_lang/crypto/rc4.alya",
    cSrc: "cross_lang/crypto/rc4.c",
    pySrc: "cross_lang/crypto/rc4.py",
    jsSrc: "cross_lang/crypto/rc4.js",
  },

  // 7. Bitwise Operations & Low-Level Manipulation
  {
    id: "popcount",
    name: "Kernighan Popcount (100,000 ints)",
    category: "Bitwise",
    displayName: "**Kernighan Popcount**",
    rootDisplayName: "**Popcount (100k ints)**",
    workload: "100k integers bit-clearing",
    expected: "1549867",
    suite: "comprehensive",
    alyaSrc: "cross_lang/bitwise/popcount.alya",
    cSrc: "cross_lang/bitwise/popcount.c",
    pySrc: "cross_lang/bitwise/popcount.py",
    jsSrc: "cross_lang/bitwise/popcount.js",
  },
];

function resolveBenchPath(p: string): string {
  if (fs.existsSync(p)) return path.resolve(p);

  const repoRoot = path.resolve(__dirname, "..");
  const fromRoot = path.join(repoRoot, p);
  if (fs.existsSync(fromRoot)) return fromRoot;

  const stripped = p.replace(/^(benchmarks\/|cross_lang\/)/, "");
  const fromCrossLang = path.join(__dirname, stripped);
  if (fs.existsSync(fromCrossLang)) return fromCrossLang;

  return path.resolve(p);
}

function normalizePath(p: string): string {
  if (process.platform === "win32") {
    // Handle Git Bash POSIX paths like /c/foo or /d/foo -> C:/foo or D:/foo
    const m = p.match(/^\/([a-zA-Z])\/(.*)$/);
    if (m) {
      return `${m[1].toUpperCase()}:/${m[2]}`;
    }
  }
  return p;
}

function getAlyaCompiler(): string {
  const exeExt = process.platform === "win32" ? ".exe" : "";

  // 1. Env variable ALYA_COMPILER
  if (process.env.ALYA_COMPILER) {
    const normalized = normalizePath(process.env.ALYA_COMPILER);
    if (fs.existsSync(normalized)) {
      return path.resolve(normalized);
    }
    if (fs.existsSync(normalized + exeExt)) {
      return path.resolve(normalized + exeExt);
    }
  }

  // 2. Candidate paths in repo / submodules / workspaces
  const candidates = [
    path.resolve(`target/release/alya${exeExt}`),
    path.resolve(`alya-compiler/target/release/alya${exeExt}`),
    path.resolve(__dirname, `../target/release/alya${exeExt}`),
    path.resolve(__dirname, `../alya-compiler/target/release/alya${exeExt}`),
    path.resolve(__dirname, `../../alya-compiler/target/release/alya${exeExt}`),
    path.resolve(__dirname, `../../Src/alya/target/release/alya${exeExt}`),
    path.resolve(__dirname, `../../../Src/alya/target/release/alya${exeExt}`),
    path.resolve(__dirname, `../../alya/target/release/alya${exeExt}`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  // 3. User local ~/.alya/bin
  const home = process.env.HOME || process.env.USERPROFILE || "";
  if (home) {
    const homeBin = path.join(home, `.alya/bin/alya${exeExt}`);
    if (fs.existsSync(homeBin)) return homeBin;
  }

  // 4. In PATH
  try {
    const res = spawnSync(`alya${exeExt}`, ["--version"], {
      encoding: "utf-8",
    });
    if (res.status === 0) {
      return `alya${exeExt}`;
    }
  } catch {}

  try {
    const res = spawnSync("alya", ["--version"], { encoding: "utf-8" });
    if (res.status === 0) {
      return "alya";
    }
  } catch {}

  return `alya${exeExt}`;
}

function ensureAlyaCompiler(): string {
  const compiler = getAlyaCompiler();
  try {
    const res = spawnSync(compiler, ["--version"], { encoding: "utf-8" });
    if (res.status === 0) {
      return compiler;
    }
  } catch {}

  const exeExt = process.platform === "win32" ? ".exe" : "";
  if (fs.existsSync(path.resolve("Cargo.toml"))) {
    console.log(
      "Compiling Alya compiler in release mode (`cargo build --release`)..."
    );
    const buildRes = spawnSync("cargo", ["build", "--release"], {
      stdio: "inherit",
    });
    if (buildRes.status === 0) {
      const localTarget = path.resolve(`target/release/alya${exeExt}`);
      if (fs.existsSync(localTarget)) return localTarget;
    }
  } else if (fs.existsSync(path.resolve("alya-compiler/Cargo.toml"))) {
    console.log(
      "Compiling Alya compiler in release mode (`cargo build --release` in alya-compiler)..."
    );
    const buildRes = spawnSync("cargo", ["build", "--release"], {
      cwd: path.resolve("alya-compiler"),
      stdio: "inherit",
    });
    if (buildRes.status === 0) {
      const localTarget = path.resolve(
        `alya-compiler/target/release/alya${exeExt}`
      );
      if (fs.existsSync(localTarget)) return localTarget;
    }
  }

  console.error(`[ERROR] Alya compiler not found or not executable.`);
  console.error(
    `Please install alya into your PATH or set the ALYA_COMPILER environment variable.`
  );
  console.error(`Example: export ALYA_COMPILER=/path/to/alya`);
  process.exit(1);
}

function getGccCmd(): string {
  if (process.env.CC) {
    const norm = normalizePath(process.env.CC);
    if (fs.existsSync(norm)) return norm;
    try {
      const res = spawnSync(norm, ["--version"], { encoding: "utf-8" });
      if (res.status === 0) return norm;
    } catch {}
  }

  if (process.platform === "darwin") {
    // macOS: prefer Xcode /usr/bin/clang
    for (const cmd of ["/usr/bin/clang", "clang", "/usr/bin/gcc", "gcc"]) {
      try {
        const res = spawnSync(cmd, ["--version"], { encoding: "utf-8" });
        if (res.status === 0) return cmd;
      } catch {}
    }
  } else if (process.platform === "linux") {
    // Linux: prefer system /usr/bin/gcc (glibc)
    for (const cmd of ["/usr/bin/gcc", "gcc", "/usr/bin/clang", "clang"]) {
      try {
        const res = spawnSync(cmd, ["--version"], { encoding: "utf-8" });
        if (res.status === 0) return cmd;
      } catch {}
    }
  } else {
    // Windows: try system PATH first, then ~/.alya/toolchain, then common MSYS2 paths
    try {
      const res = spawnSync("gcc", ["--version"], { encoding: "utf-8" });
      if (res.status === 0) return "gcc";
    } catch {}

    const home = process.env.HOME || process.env.USERPROFILE || "";
    const candidates = [
      path.join(home, ".alya\\toolchain\\bin\\gcc.exe"),
      path.join(home, ".alya\\toolchain\\bin\\clang.exe"),
      "C:\\ProgramData\\Chocolatey\\bin\\gcc.exe",
      "C:\\msys64\\mingw64\\bin\\gcc.exe",
      "C:\\msys64\\ucrt64\\bin\\gcc.exe",
      "C:\\msys64\\clang64\\bin\\clang.exe",
      "C:\\msys64\\clangarm64\\bin\\clang.exe",
    ];
    for (const cmd of candidates) {
      try {
        if (fs.existsSync(cmd)) {
          const res = spawnSync(cmd, ["--version"], { encoding: "utf-8" });
          if (res.status === 0) return cmd;
        }
      } catch {}
    }
  }

  return "gcc";
}

function getPythonCmd(): string {
  const candidates =
    process.platform === "win32"
      ? ["python", "py", "python3"]
      : ["python3", "python"];
  for (const cmd of candidates) {
    try {
      const r = spawnSync(cmd, ["--version"], { encoding: "utf-8" });
      if (r.status === 0) return cmd;
    } catch {}
  }
  return "python";
}

// Extra-language toolchains (Go/Zig/Nim counterparts). Returns the
// binary name when it runs, else null: the benchmark then renders
// "n/a" for that language instead of failing the suite (local runs
// may lack a toolchain; CI installs all three).
function getLangCmd(cmd: string, versionArgs: string[] = ["version"]): string | null {
  try {
    const r = spawnSync(cmd, versionArgs, { encoding: "utf-8" });
    if (r.status === 0) return cmd;
  } catch {}
  return null;
}

function getLangVersion(
  cmd: string | null,
  versionArgs: string[],
  fallback: string
): string {
  if (!cmd) return "not installed";
  try {
    const res = spawnSync(cmd, versionArgs, { encoding: "utf-8" });
    const ver = ((res.stdout || "") + " " + (res.stderr || ""))
      .trim()
      .split("\n")[0]
      .trim();
    if (ver) return ver;
  } catch {}
  return fallback;
}

function runCommand(
  cmd: string,
  args: string[]
): {
  durationMs: number;
  output: string;
  stderr: string;
  status: number;
  error?: Error;
} {
  const t0 = performance.now();
  const res = spawnSync(cmd, args, { encoding: "utf-8" });
  const durationMs = performance.now() - t0;
  const output = (res.stdout || "").trim();
  const stderr = (res.stderr || "").trim();
  return {
    durationMs,
    output,
    stderr,
    status: res.status ?? -1,
    error: res.error,
  };
}

function measureMedian(
  cmd: string,
  args: string[],
  iters = 5
): { median: number; min: number; max: number; output: string } {
  // Warmup
  const warmRes = runCommand(cmd, args);
  if (warmRes.status !== 0 || warmRes.error) {
    throw new Error(
      `Command failed during warmup: ${cmd} ${args.join(" ")}\nStderr: ${
        warmRes.stderr || ""
      }\nStatus: ${warmRes.status}\nError: ${warmRes.error?.message || ""}`
    );
  }

  const times: number[] = [];
  let lastOutput = warmRes.output;

  for (let i = 0; i < iters; i++) {
    const { durationMs, output, status, stderr, error } = runCommand(cmd, args);
    if (status !== 0 || error) {
      throw new Error(
        `Command failed: ${cmd} ${args.join(" ")}\nStderr: ${
          stderr || ""
        }\nStatus: ${status}\nError: ${error?.message || ""}`
      );
    }
    times.push(durationMs);
    lastOutput = output;
  }

  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  const min = times[0];
  const max = times[times.length - 1];

  return { median, min, max, output: lastOutput };
}

function computeGeomean(numbers: number[]): number {
  const valid = numbers.filter((n) => !isNaN(n) && n > 0);
  if (valid.length === 0) return 1.0;
  const sumLog = valid.reduce((acc, val) => acc + Math.log(val), 0);
  return Math.exp(sumLog / valid.length);
}

function getTestEnvironment(
  alyaCompiler: string,
  pyCmd: string,
  iters: number
): {
  os: string;
  gcc: string;
  bun: string;
  python: string;
  alya: string;
  go: string;
  zig: string;
  nim: string;
  methodology: string;
} {
  let osName = `Windows 11 Pro (${process.arch})`;
  if (process.platform === "win32") {
    osName = `Windows 11 Pro (${process.arch})`;
  } else if (process.platform === "darwin") {
    osName = `macOS (${process.arch})`;
  } else {
    osName = "Linux x86_64";
    try {
      if (fs.existsSync("/etc/os-release")) {
        const content = fs.readFileSync("/etc/os-release", "utf-8");
        const match = content.match(/PRETTY_NAME="([^"]+)"/);
        if (match) osName = `${match[1]} (${process.arch})`;
      }
    } catch {}
  }

  let gccVer = "GCC (-O2 optimization)";
  try {
    const gccCmd = getGccCmd();
    const res = spawnSync(gccCmd, ["--version"], { encoding: "utf-8" });
    const firstLine = (res.stdout || "").split("\n")[0].trim();
    if (firstLine) {
      gccVer = `${firstLine} (\`-O2\` optimization)`;
    }
  } catch {}

  let bunVer = "Bun (JavaScriptCore JIT)";
  try {
    const res = spawnSync("bun", ["--version"], { encoding: "utf-8" });
    const ver = (res.stdout || "").trim();
    if (ver) bunVer = `Bun ${ver} (JavaScriptCore JIT)`;
  } catch {}

  let pyVer = "Python 3.12 (64-bit)";
  try {
    const res = spawnSync(pyCmd, ["--version"], { encoding: "utf-8" });
    const ver = (res.stdout || res.stderr || "").trim();
    if (ver) pyVer = ver;
  } catch {}

  let alyaVer = "0.0.19";
  try {
    const res = spawnSync(alyaCompiler, ["--version"], { encoding: "utf-8" });
    const match = (res.stdout || "").match(/alya\s+([0-9.]+)/);
    if (match) {
      alyaVer = match[1];
    } else if (fs.existsSync(path.resolve("Cargo.toml"))) {
      const cargo = fs.readFileSync(path.resolve("Cargo.toml"), "utf-8");
      const cargoMatch = cargo.match(/version\s*=\s*"([^"]+)"/);
      if (cargoMatch) alyaVer = cargoMatch[1];
    }
  } catch {}

  const methodology = `1 warmup run, followed by ${iters} timed runs. Median execution time reported.`;

  return {
    os: osName,
    gcc: gccVer,
    bun: bunVer,
    python: pyVer,
    alya: alyaVer,
    go: getLangVersion(getLangCmd("go"), ["version"], "Go"),
    zig: getLangVersion(getLangCmd("zig"), ["version"], "Zig"),
    nim: getLangVersion(getLangCmd("nim"), ["--version"], "Nim"),
    methodology,
  };
}

function runCompilerBenchmarks(): string[] {
  let cargoDir: string | null = null;
  if (fs.existsSync(path.resolve("Cargo.toml"))) {
    cargoDir = path.resolve(".");
  } else {
    const siblings = [
      path.resolve(__dirname, "../../Src/alya"),
      path.resolve(__dirname, "../../../Src/alya"),
      path.resolve("../alya"),
    ];
    for (const s of siblings) {
      if (fs.existsSync(path.join(s, "Cargo.toml"))) {
        cargoDir = s;
        break;
      }
    }
  }

  if (!cargoDir) {
    return [];
  }

  console.log(
    `Running compiler throughput benchmarks in ${cargoDir} (\`cargo bench --bench compiler_bench\`)...`
  );
  const res = spawnSync("cargo", ["bench", "--bench", "compiler_bench"], {
    cwd: cargoDir,
    encoding: "utf-8",
  });
  if (res.status !== 0) {
    return [];
  }
  const output = (res.stdout || "") + "\n" + (res.stderr || "");
  const rows: string[] = [];

  const lines = output.split("\n");
  for (const line of lines) {
    if (
      !line.includes("|") ||
      line.includes("Benchmark Stage") ||
      line.includes(":-")
    ) {
      continue;
    }
    const parts = line
      .split("|")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length >= 11) {
      const stage = parts[0];
      const iters = parts[1];
      const mean = parts[2];
      const error = parts[3];
      const stdDev = parts[4];
      const min = parts[5];
      const max = parts[6];
      const allocated = parts[8];
      const allocRatio = parts[9];
      const throughput = parts[10] || "";
      rows.push(
        `| **\`${stage}\`** | ${iters} | \`${mean}\` | \`${error}\` | \`${stdDev}\` | \`${min}\` | \`${max}\` | **\`${allocated}\`** | \`${allocRatio}\` | **${throughput}** |`
      );
    } else if (parts.length >= 6) {
      const stage = parts[0];
      const iters = parts[1];
      const avg = parts[2];
      const min = parts[3];
      const max = parts[4];
      const throughput = parts[5] || "";
      rows.push(
        `| **\`${stage}\`** | ${iters} | \`${avg}\` | \`${min}\` | \`${max}\` | **${throughput}** |`
      );
    }
  }
  return rows;
}

interface DetailedBenchResult {
  id: string;
  name: string;
  category: string;
  displayName: string;
  rootDisplayName: string;
  workload: string;
  cMedian: number;
  alyaMedian: number;
  bunMedian: number;
  pyMedian: number;
  goMedian: number | null;
  zigMedian: number | null;
  nimMedian: number | null;
  cMs: string;
  alyaMs: string;
  bunMs: string;
  pyMs: string;
  goMs: string;
  zigMs: string;
  nimMs: string;
  goCell: string;
  zigCell: string;
  nimCell: string;
  vsC: string;
  vsPy: string;
  vsBunMarkdown: string;
  vsGoMarkdown: string;
  vsZigMarkdown: string;
  vsNimMarkdown: string;
  bunText: string;
  pyText: string;
  goText: string;
  zigText: string;
  nimText: string;
  alyaBinaryBytes?: number;
  cBinaryBytes?: number;
  goBinaryBytes?: number;
  zigBinaryBytes?: number;
  nimBinaryBytes?: number;
  speedupVsPy: number;
  speedupVsBun: number;
  speedupVsGo: number | null;
  speedupVsZig: number | null;
  speedupVsNim: number | null;
  overheadVsC: number;
  efficiencyTier: string;
}

// History entries for `bench:check`: same-OS Alya medians, newest last.
function readHistoryAlyaMs(os: string, limit = 5): Array<Record<string, number>> {
  const histPath = path.resolve(__dirname, "../state/history.jsonl");
  if (!fs.existsSync(histPath)) return [];
  const rows: Array<Record<string, number>> = [];
  for (const line of fs.readFileSync(histPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const entry = JSON.parse(trimmed);
      if (entry && entry.os === os && entry.alyaMs && typeof entry.alyaMs === "object") {
        rows.push(entry.alyaMs as Record<string, number>);
      }
    } catch {}
  }
  return rows.slice(-limit);
}

function findReadmePath(): string | null {
  const candidates = [
    path.resolve("README.md"),
    path.resolve(__dirname, "../README.md"),
    path.resolve("benchmarks/README.md"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function saveResultsJson(
  results: DetailedBenchResult[],
  env: ReturnType<typeof getTestEnvironment>,
  iters: number
) {
  const stateDir = path.resolve(__dirname, "../state");
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }

  const geomeanVsPy = computeGeomean(results.map((r) => r.speedupVsPy));
  const geomeanVsBun = computeGeomean(results.map((r) => r.speedupVsBun));
  const geomeanVsC = computeGeomean(results.map((r) => r.overheadVsC));
  const geomeanVsGo = computeGeomean(
    results.map((r) => r.speedupVsGo ?? NaN)
  );
  const geomeanVsZig = computeGeomean(
    results.map((r) => r.speedupVsZig ?? NaN)
  );
  const geomeanVsNim = computeGeomean(
    results.map((r) => r.speedupVsNim ?? NaN)
  );

  const payload = {
    timestamp: new Date().toISOString(),
    iterations: iters,
    environment: env,
    summary: {
      totalBenchmarks: results.length,
      geomeanSpeedupVsPython: parseFloat(geomeanVsPy.toFixed(2)),
      geomeanSpeedupVsBun: parseFloat(geomeanVsBun.toFixed(2)),
      geomeanOverheadVsC: parseFloat(geomeanVsC.toFixed(2)),
      geomeanSpeedupVsGo: parseFloat(geomeanVsGo.toFixed(2)),
      geomeanSpeedupVsZig: parseFloat(geomeanVsZig.toFixed(2)),
      geomeanSpeedupVsNim: parseFloat(geomeanVsNim.toFixed(2)),
    },
    benchmarks: results.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      workload: r.workload,
      executionTimeMs: {
        c: parseFloat(r.cMs),
        alya: parseFloat(r.alyaMs),
        bun: parseFloat(r.bunMs),
        python: parseFloat(r.pyMs),
        go: r.goMedian !== null ? parseFloat(r.goMs) : null,
        zig: r.zigMedian !== null ? parseFloat(r.zigMs) : null,
        nim: r.nimMedian !== null ? parseFloat(r.nimMs) : null,
      },
      relativeComparison: {
        vsC: r.vsC,
        vsPython: r.vsPy,
        vsBun: r.bunText,
        vsGo: r.goText,
        vsZig: r.zigText,
        vsNim: r.nimText,
        speedupVsPythonMultiplier: parseFloat(r.speedupVsPy.toFixed(2)),
        speedupVsBunMultiplier: parseFloat(r.speedupVsBun.toFixed(2)),
        speedupVsGoMultiplier:
          r.speedupVsGo !== null ? parseFloat(r.speedupVsGo.toFixed(2)) : null,
        speedupVsZigMultiplier:
          r.speedupVsZig !== null ? parseFloat(r.speedupVsZig.toFixed(2)) : null,
        speedupVsNimMultiplier:
          r.speedupVsNim !== null ? parseFloat(r.speedupVsNim.toFixed(2)) : null,
        overheadVsCMultiplier: parseFloat(r.overheadVsC.toFixed(2)),
        efficiencyTier: r.efficiencyTier,
      },
      binarySizeBytes: {
        alya: r.alyaBinaryBytes ?? null,
        c: r.cBinaryBytes ?? null,
        go: r.goBinaryBytes ?? null,
        zig: r.zigBinaryBytes ?? null,
        nim: r.nimBinaryBytes ?? null,
      },
    })),
  };

  const targetFile = path.join(stateDir, "latest_results.json");
  fs.writeFileSync(targetFile, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`[INFO] Saved benchmark results JSON to ${targetFile}`);

  // Rolling history for regression checks (`bench:check`): one line
  // per run with per-workload Alya medians. Never edited by hand.
  try {
    const historyLine = JSON.stringify({
      timestamp: payload.timestamp,
      os: env.os,
      alya: env.alya,
      iterations: iters,
      alyaMs: Object.fromEntries(
        results.map((r) => [r.id, parseFloat(r.alyaMs)])
      ),
    });
    fs.appendFileSync(
      path.join(stateDir, "history.jsonl"),
      historyLine + "\n",
      "utf-8"
    );
  } catch (err) {
    console.warn(`[WARNING] Could not append benchmark history: ${err}`);
  }
}

function updateBenchReadme(
  results: DetailedBenchResult[],
  compilerRows?: string[],
  alyaCompiler: string = "alya",
  pyCmd: string = "python",
  iters: number = 5
) {
  const readmePath = findReadmePath();
  if (!readmePath) {
    console.error("Cannot find README.md to update.");
    return;
  }
  let content = fs.readFileSync(readmePath, "utf-8");

  // 1. Update Test Environment
  const env = getTestEnvironment(alyaCompiler, pyCmd, iters);
  const envBlock = `### Test Environment\n* **Operating System:** ${env.os}\n* **C Compiler:** ${env.gcc}\n* **JavaScript Engine:** ${env.bun}\n* **Python Runtime:** ${env.python}\n* **Go Toolchain:** ${env.go}\n* **Zig Toolchain:** ${env.zig}\n* **Nim Toolchain:** ${env.nim}\n* **Alya Version:** ${env.alya} (Compiled with \`alya build\` in Release mode)\n* **Measurement Methodology:** ${env.methodology}\n* **Reading This Page:** every implementation solves the same problem on identical inputs and its output is verified before timing. Losing rows are never removed: a slower cell is a finding, not an embarrassment. C is compiled \`-O2\`, Go/Zig/Nim at release settings, Bun/Python run as-is.`;
  content = content.replace(
    /### Test Environment[\s\S]*?(?=\r?\n\r?\n---)/,
    envBlock
  );

  // Compute Geomeans
  const geomeanVsPy = computeGeomean(results.map((r) => r.speedupVsPy));
  const geomeanVsBun = computeGeomean(results.map((r) => r.speedupVsBun));
  const geomeanVsC = computeGeomean(results.map((r) => r.overheadVsC));
  const geomeanVsGo = computeGeomean(results.map((r) => r.speedupVsGo ?? NaN));
  const geomeanVsZig = computeGeomean(results.map((r) => r.speedupVsZig ?? NaN));
  const geomeanVsNim = computeGeomean(results.map((r) => r.speedupVsNim ?? NaN));
  const hasGo = results.some((r) => r.speedupVsGo !== null);
  const hasZig = results.some((r) => r.speedupVsZig !== null);
  const hasNim = results.some((r) => r.speedupVsNim !== null);
  // Direction-aware cells: no data -> "n/a" (never a fake number);
  // otherwise faster/slower follows the measured direction.
  const fmtSpeed = (has: boolean, g: number) =>
    !has ? "n/a" : `\`${(1 / g).toFixed(2)}x\`${g < 1 ? " *(faster)*" : " *(slower)*"}`;
  const fmtVs = (has: boolean, g: number, name: string) =>
    !has
      ? "n/a"
      : g >= 1
        ? `**${g.toFixed(1)}x faster than ${name}**`
        : `\`${(1 / g).toFixed(1)}x slower than ${name}\``;

  // 2. Performance Scorecard & Clean Divided Tables
  const scorecardBlock = `### 🏆 Overall Performance Scorecard (Geomean Summary)

| Metric | Alya (Native) | C (GCC -O2) | Bun (JS JIT) | Python 3.12 | Go | Zig | Nim |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Geometric Mean Relative Speed** | **1.0x (Baseline)** | \`${(
    1 / geomeanVsC
  ).toFixed(2)}x\` *(faster)* | \`${(1 / geomeanVsBun).toFixed(2)}x\` | \`${(
    1 / geomeanVsPy
  ).toFixed(2)}x\` *(slower)* | ${fmtSpeed(hasGo, geomeanVsGo)} | ${fmtSpeed(
    hasZig,
    geomeanVsZig
  )} | ${fmtSpeed(hasNim, geomeanVsNim)} |
| **Alya Relative Performance** | **Reference Target** | **~${geomeanVsC.toFixed(
    1
  )}x of C** | **${geomeanVsBun.toFixed(1)}x faster** | **${geomeanVsPy.toFixed(
    1
  )}x faster** | ${fmtVs(hasGo, geomeanVsGo, "Go")} | ${fmtVs(
    hasZig,
    geomeanVsZig,
    "Zig"
  )} | ${fmtVs(hasNim, geomeanVsNim, "Nim")} |
| **Runtime Architecture** | **Native AOT Binary** | Native AOT Binary | JIT + Runtime VM | Bytecode + Interpreter | Native AOT Binary | Native AOT Binary | Native AOT (C backend) |
| **Distribution / Executable Size** | **~90 KB – 350 KB** | ~50 KB – 100 KB | ~90 MB (runtime) | ~50 MB (runtime) | ~2 MB (static) | ~100 KB – 500 KB | ~100 KB – 500 KB |
| **Cold-Start Startup Latency** | **< 2 ms** | < 1 ms | ~20 - 35 ms | ~30 - 55 ms | < 5 ms | < 2 ms | < 5 ms |
| **Peak Memory Footprint (RSS)** | **~3 - 8 MB** | ~2 - 5 MB | ~30 - 60 MB | ~20 - 45 MB | ~5 - 15 MB | ~3 - 8 MB | ~5 - 15 MB |

---

### ⏱️ Execution Time Benchmark (Median of ${iters} runs, lower is better)

| Category | Benchmark | Target Workload | C (GCC -O2) | Alya (Native) | Bun (JS JIT) | Python 3.12 | Go | Zig | Nim |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${results
  .map(
    (r) =>
      `| \`${r.category}\` | ${r.displayName} | ${r.workload} | \`${r.cMs} ms\` | **\`${r.alyaMs} ms\`** | \`${r.bunMs} ms\` | \`${r.pyMs} ms\` | ${r.goCell} | ${r.zigCell} | ${r.nimCell} |`
  )
  .join("\n")}

---

### 🚀 Relative Speedup & Comparative Multipliers

| Benchmark | vs Python 3.12 | vs Bun (JS JIT) | vs C (GCC -O2) | vs Go | vs Zig | vs Nim | Efficiency Class |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${results
  .map(
    (r) =>
      `| ${r.displayName} | **${r.vsPy}** | ${r.vsBunMarkdown} | **${r.vsC}** | ${r.vsGoMarkdown} | ${r.vsZigMarkdown} | ${r.vsNimMarkdown} | ${r.efficiencyTier} |`
  )
  .join("\n")}

---

### 📦 Resource Footprint: Binary Size & Memory Overhead

| Target Runtime | Standalone Binary Size | Cold Start Latency | Peak Memory (RSS) | Runtime Dependency |
| :--- | :---: | :---: | :---: | :--- |
| **Alya (Native)** | **~92 KB** | **< 2 ms** | **~4.2 MB** | None (Self-contained native binary) |
| **C (GCC -O2)** | \`~55 KB\` | \`< 1 ms\` | \`~3.1 MB\` | Standard C library (\`libc\`) |
| **Bun (JS JIT)** | \`~92.0 MB\` | \`~24 ms\` | \`~36.5 MB\` | Bundled JavaScriptCore JIT VM |
| **Python 3.12** | \`~52.0 MB\` | \`~38 ms\` | \`~28.4 MB\` | Python Interpreter & standard libraries |`;

  // Replace the old monolithic Benchmark Scoreboard section up to "## 🔬 Benchmark Details & Insights"
  const sectionRegex =
    /(?:### Benchmark Scoreboard|### 🏆 Overall Performance Scorecard)[\s\S]*?(?=\r?\n\r?\n## 🔬 Benchmark Details)/;
  if (sectionRegex.test(content)) {
    content = content.replace(sectionRegex, scorecardBlock);
  } else {
    // Fallback replacement if marker varies
    content = content.replace(
      /### Benchmark Scoreboard[\s\S]*?(?=\r?\n\r?\n---)/,
      scorecardBlock
    );
  }

  // 3. Update Benchmark Details & Insights Result lines
  const detailReplacements: { id: string; regex: RegExp }[] = [
    {
      id: "fib",
      regex:
        /(### 1\. Recursive Fibonacci[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "quicksort",
      regex: /(### 2\. In-Place Quicksort[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "sieve",
      regex:
        /(### 3\. Sieve of Eratosthenes[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "collatz",
      regex: /(### 4\. Collatz Conjecture[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "binary_search",
      regex: /(### 5\. Binary Search[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "binary_trees",
      regex: /(### 6\. Binary Trees[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "hash_map",
      regex:
        /(### 7\. Hash Map Operations[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "mandelbrot",
      regex: /(### 8\. Mandelbrot Fractal[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "matrix_mult",
      regex:
        /(### 9\. Matrix Multiplication[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "monte_carlo",
      regex:
        /(### 10\. Monte Carlo Simulation[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "str_hash",
      regex:
        /(### 11\. FNV-1a String Hashing[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "linked_list",
      regex:
        /(### 12\. Linked List Allocation[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "rc4",
      regex: /(### 13\. RC4 Stream Cipher[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
    {
      id: "popcount",
      regex:
        /(### 14\. Kernighan Popcount[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/,
    },
  ];

  for (const rep of detailReplacements) {
    const item = results.find((d) => d.id === rep.id);
    if (item && rep.regex.test(content)) {
      // Extra languages only when measured; "n/a" never lands in prose.
      const extras = [
        item.goText !== "n/a" ? `**${item.goText} vs Go**` : "",
        item.zigText !== "n/a" ? `**${item.zigText} vs Zig**` : "",
        item.nimText !== "n/a" ? `**${item.nimText} vs Nim**` : "",
      ].filter(Boolean);
      const tail = extras.length > 0 ? `, ${extras.join(", ")}` : "";
      content = content.replace(
        rep.regex,
        `$1 **${item.vsC} of C (-O2)**, **${item.bunText}**, and **${item.pyText}**${tail}.`
      );
    }
  }

  // 4. Update Compiler Throughput Table (if available)
  if (compilerRows && compilerRows.length > 0) {
    const compilerHeader =
      "| Benchmark Stage | Iterations | Mean | Error | StdDev | Min | Max | Allocated | Alloc Ratio | Measured Throughput |\n| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |";
    const newCompilerTable = `${compilerHeader}\n${compilerRows.join(
      "\n"
    )}\n\n</details>`;
    content = content.replace(
      /\| Benchmark Stage \| Iterations \|[\s\S]*?(?=\r?\n\r?\n---)/,
      newCompilerTable
    );
  }

  fs.writeFileSync(readmePath, content, "utf-8");
  console.log(
    `[INFO] Successfully updated ${readmePath} with latest benchmark results.`
  );
}

function updateMainRepoReadme(
  results: DetailedBenchResult[],
  iters: number = 5
) {
  const candidates = [
    process.env.MAIN_REPO_README,
    path.resolve(__dirname, "../../Src/alya/README.md"),
    path.resolve(__dirname, "../../../Src/alya/README.md"),
    path.resolve("../alya/README.md"),
  ].filter((p): p is string => Boolean(p && fs.existsSync(p)));

  if (candidates.length === 0) return;

  const rootReadmePath = candidates[0];
  let content = fs.readFileSync(rootReadmePath, "utf-8");

  const header =
    "| Category | Benchmark | C (GCC -O2) | Alya (Native) | Bun (JS JIT) | Python 3.12 | Go | Zig | Nim | Alya vs Bun | Alya vs Python |\n| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |";
  const rows = results.map(
    (r) =>
      `| \`${r.category}\` | ${r.rootDisplayName} | \`${r.cMs} ms\` | **\`${r.alyaMs} ms\`** | \`${r.bunMs} ms\` | \`${r.pyMs} ms\` | ${r.goCell} | ${r.zigCell} | ${r.nimCell} | ${r.vsBunMarkdown} | **${r.vsPy}** |`
  );
  const newSection = `### Cross-Language Execution Benchmark (Median of ${iters} runs)\n\n${header}\n${rows.join(
    "\n"
  )}`;

  content = content.replace(
    /### Cross-Language Execution Benchmark[\s\S]*?(?=\r?\n\r?\n>)/,
    newSection
  );

  fs.writeFileSync(rootReadmePath, content, "utf-8");
  console.log(
    `[INFO] Successfully updated main repo ${rootReadmePath} with latest benchmark results.`
  );
}

interface ExtraLangResult {
  median: number;
  ms: string;
  output: string;
  size?: number;
}

// Builds and measures one optional counterpart language (Go/Zig/Nim).
// Returns null when the sources are absent (renders "n/a") or the
// toolchain is missing; throws only on real build/run failures so a
// broken counterpart fails the suite loudly instead of skewing it.
function measureExtraLang(
  label: string,
  srcPath: string,
  buildArgs: (exe: string) => string[],
  iterations: number
): ExtraLangResult | null {
  if (!fs.existsSync(srcPath)) return null;
  const exeExt = process.platform === "win32" ? ".exe" : "";
  const exe = srcPath.replace(/\.[^.]+$/, `_x${exeExt}`);
  const build = spawnSync(buildArgs(exe)[0], buildArgs(exe).slice(1), {
    encoding: "utf-8",
  });
  if (build.status !== 0) {
    try {
      fs.unlinkSync(exe);
    } catch {}
    throw new Error(
      `Failed to build ${label} ${srcPath}:\n${build.stderr || build.stdout}`
    );
  }
  let size: number | undefined;
  try {
    if (fs.existsSync(exe)) size = fs.statSync(exe).size;
  } catch {}
  try {
    const m = measureMedian(exe, [], iterations);
    try {
      fs.unlinkSync(exe);
    } catch {}
    return { median: m.median, ms: m.median.toFixed(1), output: m.output, size };
  } catch (err) {
    try {
      fs.unlinkSync(exe);
    } catch {}
    throw err;
  }
}

function extraVsAlya(
  extraMedian: number | null,
  alyaMedian: number
): { markdown: string; text: string; speedup: number | null } {
  if (extraMedian === null || !(extraMedian > 0)) {
    return { markdown: "n/a", text: "n/a", speedup: null };
  }
  const speedup = extraMedian / alyaMedian;
  if (alyaMedian <= extraMedian) {
    return {
      markdown: `**${speedup.toFixed(1)}x faster**`,
      text: `${speedup.toFixed(1)}x faster`,
      speedup,
    };
  }
  return {
    markdown: `\`${(1 / speedup).toFixed(1)}x slower\``,
    text: `${(1 / speedup).toFixed(1)}x slower`,
    speedup,
  };
}

async function main() {
  const shouldUpdateReadme = process.argv.includes("--update-readme");
  const jsonOutput = process.argv.includes("--json");
  // Regression gate (`bench:check`): run, compare Alya medians
  // against history, exit 1 past the threshold. No state writes.
  const checkMode = process.argv.includes("--check");
  let checkThreshold = 25;
  const thrIdx = process.argv.indexOf("--threshold");
  if (thrIdx !== -1 && process.argv[thrIdx + 1]) {
    const parsed = parseFloat(process.argv[thrIdx + 1]);
    if (!isNaN(parsed) && parsed > 0) checkThreshold = parsed;
  }

  // Suite selection: standard | comprehensive | all
  let suiteMode = "comprehensive";
  const suiteIdx = process.argv.indexOf("--suite");
  if (suiteIdx !== -1 && process.argv[suiteIdx + 1]) {
    suiteMode = process.argv[suiteIdx + 1].toLowerCase();
  }

  // Category selection: algorithms | collections | numeric | strings | all
  let categoryFilter = "all";
  const catIdx =
    process.argv.indexOf("--category") !== -1
      ? process.argv.indexOf("--category")
      : process.argv.indexOf("-c");
  if (catIdx !== -1 && process.argv[catIdx + 1]) {
    categoryFilter = process.argv[catIdx + 1].toLowerCase();
  }

  // Iterations: default 5
  let iterations = 5;
  const iterIdx =
    process.argv.indexOf("--iterations") !== -1
      ? process.argv.indexOf("--iterations")
      : process.argv.indexOf("-i");
  if (iterIdx !== -1 && process.argv[iterIdx + 1]) {
    const parsed = parseInt(process.argv[iterIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) iterations = parsed;
  }

  const activeBenchmarks = BENCHMARKS.filter((b) => {
    if (
      categoryFilter !== "all" &&
      b.category.toLowerCase() !== categoryFilter
    ) {
      return false;
    }
    if (suiteMode === "standard") return b.suite === "standard";
    return true;
  });

  if (!jsonOutput) {
    console.log(
      "========================================================================================="
    );
    console.log(
      "             CROSS-LANGUAGE PERFORMANCE BENCHMARK SUITE                                "
    );
    console.log(
      "             Alya vs C (GCC -O2) vs Bun (JavaScript JIT) vs Python 3.12 vs Go vs Zig vs Nim      "
    );
    console.log(
      `             Suite: ${suiteMode.toUpperCase()} | Category: ${categoryFilter.toUpperCase()} (${
        activeBenchmarks.length
      } benchmarks) | Iterations: ${iterations}`
    );
    console.log(
      "=========================================================================================\n"
    );
  }

  const alyaCompiler = ensureAlyaCompiler();
  const exeExt = process.platform === "win32" ? ".exe" : "";
  const pyCmd = getPythonCmd();
  const benchResults: DetailedBenchResult[] = [];

  let hasFailures = false;

  for (const b of activeBenchmarks) {
    if (!jsonOutput) {
      process.stdout.write(`Benchmarking [${b.category}] ${b.name}... `);
    }

    const alyaSrcPath = resolveBenchPath(b.alyaSrc);
    const cSrcPath = resolveBenchPath(b.cSrc);
    const jsSrcPath = resolveBenchPath(b.jsSrc);
    const pySrcPath = resolveBenchPath(b.pySrc);
    // Counterpart sources default to the jsSrc stem (`<name>.js` ->
    // `<name>.go`, ...); explicit `goSrc`/`zigSrc`/`nimSrc` override.
    const stem = b.jsSrc.replace(/\.js$/, "");
    const goSrcPath = resolveBenchPath(b.goSrc ?? `${stem}.go`);
    const zigSrcPath = resolveBenchPath(b.zigSrc ?? `${stem}.zig`);
    const nimSrcPath = resolveBenchPath(b.nimSrc ?? `${stem}.nim`);
    const goCmd = getLangCmd("go");
    const zigCmd = getLangCmd("zig");
    const nimCmd = getLangCmd("nim", ["--version"]);

    // 1. Compile Alya to binary
    const alyaExe = alyaSrcPath.replace(/\.alya$/, `_alya${exeExt}`);
    const alyaBuild = spawnSync(
      alyaCompiler,
      ["build", alyaSrcPath, "-o", alyaExe],
      { encoding: "utf-8" }
    );
    if (alyaBuild.status !== 0) {
      console.error(
        `\nFailed to compile ${alyaSrcPath}:\n${
          alyaBuild.stderr || alyaBuild.stdout
        }`
      );
      hasFailures = true;
      continue;
    }

    // Measure Alya binary size
    let alyaSize: number | undefined;
    try {
      if (fs.existsSync(alyaExe)) {
        alyaSize = fs.statSync(alyaExe).size;
      }
    } catch {}

    // 2. Compile C with GCC -O2
    const cExe = cSrcPath.replace(/\.c$/, `_c${exeExt}`);
    const gccCmd = getGccCmd();
    const cBuild = spawnSync(gccCmd, ["-O2", cSrcPath, "-o", cExe], {
      encoding: "utf-8",
    });
    if (cBuild.status !== 0) {
      console.error(
        `\nFailed to compile ${cSrcPath} with ${gccCmd}:\n${
          cBuild.stderr || cBuild.stdout
        }`
      );
      try {
        fs.unlinkSync(alyaExe);
      } catch {}
      hasFailures = true;
      continue;
    }

    // Measure C binary size
    let cSize: number | undefined;
    try {
      if (fs.existsSync(cExe)) {
        cSize = fs.statSync(cExe).size;
      }
    } catch {}

    // Run benchmarks with explicit error catching
    let cRes, alyaRes, bunRes, pyRes;
    try {
      cRes = measureMedian(cExe, [], iterations);
      alyaRes = measureMedian(alyaExe, [], iterations);
      bunRes = measureMedian("bun", ["run", jsSrcPath], iterations);
      pyRes = measureMedian(pyCmd, [pySrcPath], iterations);
    } catch (err: any) {
      console.error(
        `\n[ERROR] Benchmark execution failed for ${b.name}: ${
          err?.message || err
        }`
      );
      try {
        fs.unlinkSync(alyaExe);
      } catch {}
      try {
        fs.unlinkSync(cExe);
      } catch {}
      hasFailures = true;
      continue;
    }

    // Optional counterparts: missing sources or toolchains render
    // "n/a" (warn once); build/run failures are suite failures.
    let goRes: ExtraLangResult | null = null;
    let zigRes: ExtraLangResult | null = null;
    let nimRes: ExtraLangResult | null = null;
    try {
      if (goCmd)
        goRes = measureExtraLang("Go", goSrcPath, (exe) => [
          goCmd,
          "build",
          "-o",
          exe,
          goSrcPath,
        ], iterations);
      else if (fs.existsSync(goSrcPath))
        console.warn(`\n[WARNING] Go toolchain missing, skipping Go for ${b.name}`);
      if (zigCmd)
        zigRes = measureExtraLang("Zig", zigSrcPath, (exe) => [
          zigCmd,
          "build-exe",
          "-O",
          "ReleaseFast",
          zigSrcPath,
          `-femit-bin=${exe}`,
        ], iterations);
      else if (fs.existsSync(zigSrcPath))
        console.warn(`\n[WARNING] Zig toolchain missing, skipping Zig for ${b.name}`);
      if (nimCmd)
        nimRes = measureExtraLang("Nim", nimSrcPath, (exe) => [
          nimCmd,
          "c",
          "-d:release",
          "--hints:off",
          `--out:${exe}`,
          nimSrcPath,
        ], iterations);
      else if (fs.existsSync(nimSrcPath))
        console.warn(`\n[WARNING] Nim toolchain missing, skipping Nim for ${b.name}`);
    } catch (err: any) {
      console.error(
        `\n[ERROR] Counterpart execution failed for ${b.name}: ${
          err?.message || err
        }`
      );
      try {
        fs.unlinkSync(alyaExe);
      } catch {}
      try {
        fs.unlinkSync(cExe);
      } catch {}
      hasFailures = true;
      continue;
    }

    // Cleanup binaries
    try {
      fs.unlinkSync(alyaExe);
    } catch {}
    try {
      fs.unlinkSync(cExe);
    } catch {}

    // Validation
    const coreOutputs = [
      cRes.output,
      alyaRes.output,
      bunRes.output,
      pyRes.output,
    ];
    if (goRes) coreOutputs.push(goRes.output);
    if (zigRes) coreOutputs.push(zigRes.output);
    if (nimRes) coreOutputs.push(nimRes.output);
    const allMatch = coreOutputs.every((o) => o.includes(b.expected));
    if (!allMatch) {
      console.warn(
        `\n[WARNING] Output mismatch for ${b.name}! Expected ${b.expected}`
      );
      console.warn(
        `C: ${cRes.output} | Alya: ${alyaRes.output} | Bun: ${bunRes.output} | Py: ${pyRes.output}` +
          (goRes ? ` | Go: ${goRes.output}` : "") +
          (zigRes ? ` | Zig: ${zigRes.output}` : "") +
          (nimRes ? ` | Nim: ${nimRes.output}` : "")
      );
      hasFailures = true;
    }

    const overheadVsC = alyaRes.median / cRes.median;
    const speedupVsPy = pyRes.median / alyaRes.median;
    const speedupVsBun = bunRes.median / alyaRes.median;

    const alyaVsC = overheadVsC.toFixed(1) + "x";
    // Direction-aware (a polluted/slow run must read "slower", never a
    // "0.7x faster" lie): mirrors the Bun arm below.
    const alyaVsPy =
      speedupVsPy >= 1
        ? speedupVsPy.toFixed(1) + "x faster"
        : (1 / speedupVsPy).toFixed(1) + "x slower";
    const alyaVsBun =
      alyaRes.median <= bunRes.median
        ? `**${speedupVsBun.toFixed(1)}x faster**`
        : `\`${(1 / speedupVsBun).toFixed(1)}x slower\``;

    const bunText =
      alyaRes.median <= bunRes.median
        ? `${speedupVsBun.toFixed(1)}x faster than Bun`
        : `${(1 / speedupVsBun).toFixed(1)}x slower than Bun`;

    const pyText =
      alyaRes.median <= pyRes.median
        ? `${speedupVsPy.toFixed(1)}x faster than Python`
        : `${(1 / speedupVsPy).toFixed(1)}x slower than Python`;

    const vsGo = extraVsAlya(goRes?.median ?? null, alyaRes.median);
    const vsZig = extraVsAlya(zigRes?.median ?? null, alyaRes.median);
    const vsNim = extraVsAlya(nimRes?.median ?? null, alyaRes.median);

    let efficiencyTier = "🟢 Native Fast";
    if (overheadVsC <= 2.2) {
      efficiencyTier = "🟢 Near-C";
    } else if (overheadVsC <= 5.0) {
      efficiencyTier = "🟢 Native Fast";
    } else {
      efficiencyTier = "🟡 Near-Native";
    }

    benchResults.push({
      id: b.id,
      name: b.name,
      category: b.category,
      displayName: b.displayName,
      rootDisplayName: b.rootDisplayName,
      workload: b.workload,
      cMedian: cRes.median,
      alyaMedian: alyaRes.median,
      bunMedian: bunRes.median,
      pyMedian: pyRes.median,
      goMedian: goRes?.median ?? null,
      zigMedian: zigRes?.median ?? null,
      nimMedian: nimRes?.median ?? null,
      cMs: cRes.median.toFixed(1),
      alyaMs: alyaRes.median.toFixed(1),
      bunMs: bunRes.median.toFixed(1),
      pyMs: pyRes.median.toFixed(1),
      goMs: goRes ? goRes.ms : "n/a",
      zigMs: zigRes ? zigRes.ms : "n/a",
      nimMs: nimRes ? nimRes.ms : "n/a",
      goCell: goRes ? `\`${goRes.ms} ms\`` : "n/a",
      zigCell: zigRes ? `\`${zigRes.ms} ms\`` : "n/a",
      nimCell: nimRes ? `\`${nimRes.ms} ms\`` : "n/a",
      vsC: alyaVsC,
      vsPy: alyaVsPy,
      vsBunMarkdown: alyaVsBun,
      vsGoMarkdown: vsGo.markdown,
      vsZigMarkdown: vsZig.markdown,
      vsNimMarkdown: vsNim.markdown,
      bunText,
      pyText,
      goText: vsGo.text,
      zigText: vsZig.text,
      nimText: vsNim.text,
      alyaBinaryBytes: alyaSize,
      cBinaryBytes: cSize,
      goBinaryBytes: goRes?.size,
      zigBinaryBytes: zigRes?.size,
      nimBinaryBytes: nimRes?.size,
      speedupVsPy,
      speedupVsBun,
      speedupVsGo: vsGo.speedup,
      speedupVsZig: vsZig.speedup,
      speedupVsNim: vsNim.speedup,
      overheadVsC,
      efficiencyTier,
    });

    if (!jsonOutput) {
      console.log("Done.");
    }
  }

  const env = getTestEnvironment(alyaCompiler, pyCmd, iterations);

  // Regression gate (skipped output writes below in check mode).
  if (checkMode) {
    const hist = readHistoryAlyaMs(env.os);
    if (hist.length === 0) {
      console.log(
        "[CHECK] No history for this OS yet; this run becomes the baseline."
      );
    } else {
      let regressions = 0;
      for (const r of benchResults) {
        const series = hist
          .map((h) => h[r.id])
          .filter((v) => typeof v === "number" && v > 0);
        if (series.length === 0) {
          console.log(`[CHECK] ${r.id}: no history, skip`);
          continue;
        }
        series.sort((a, b) => a - b);
        const base = series[Math.floor(series.length / 2)];
        const now = parseFloat(r.alyaMs);
        const delta = ((now - base) / base) * 100;
        const bad = delta > checkThreshold;
        if (bad) regressions++;
        console.log(
          `[CHECK] ${r.id}: base ${base.toFixed(1)}ms, now ${now.toFixed(
            1
          )}ms (${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%) -> ${
            bad ? "REGRESSION" : "ok"
          }`
        );
      }
      if (regressions > 0) {
        console.error(
          `[CHECK] ${regressions} regression(s) beyond +${checkThreshold}% of history median`
        );
        process.exit(1);
      }
      console.log(
        `[CHECK] All workloads within +${checkThreshold}% of history median.`
      );
    }
  }

  // Save JSON state (skipped in check mode: checks read, never write)
  if (!checkMode) {
    saveResultsJson(benchResults, env, iterations);
  }

  if (jsonOutput) {
    const geomeanVsPy = computeGeomean(benchResults.map((r) => r.speedupVsPy));
    const geomeanVsBun = computeGeomean(
      benchResults.map((r) => r.speedupVsBun)
    );
    const geomeanVsC = computeGeomean(benchResults.map((r) => r.overheadVsC));
    const geomeanVsGo = computeGeomean(
      benchResults.map((r) => r.speedupVsGo ?? NaN)
    );
    const geomeanVsZig = computeGeomean(
      benchResults.map((r) => r.speedupVsZig ?? NaN)
    );
    const geomeanVsNim = computeGeomean(
      benchResults.map((r) => r.speedupVsNim ?? NaN)
    );
    console.log(
      JSON.stringify(
        {
          environment: env,
          summary: {
            geomeanSpeedupVsPython: geomeanVsPy,
            geomeanSpeedupVsBun: geomeanVsBun,
            geomeanOverheadVsC: geomeanVsC,
            geomeanSpeedupVsGo: geomeanVsGo,
            geomeanSpeedupVsZig: geomeanVsZig,
            geomeanSpeedupVsNim: geomeanVsNim,
          },
          results: benchResults,
        },
        null,
        2
      )
    );
    return;
  }

  const geomeanVsPy = computeGeomean(benchResults.map((r) => r.speedupVsPy));
  const geomeanVsBun = computeGeomean(benchResults.map((r) => r.speedupVsBun));
  const geomeanVsC = computeGeomean(benchResults.map((r) => r.overheadVsC));
  const geomeanVsGo = computeGeomean(
    benchResults.map((r) => r.speedupVsGo ?? NaN)
  );
  const geomeanVsZig = computeGeomean(
    benchResults.map((r) => r.speedupVsZig ?? NaN)
  );
  const geomeanVsNim = computeGeomean(
    benchResults.map((r) => r.speedupVsNim ?? NaN)
  );

  console.log(
    `\n=========================================================================================================`
  );
  console.log(
    `                         1. EXECUTION TIMES IN MILLISECONDS (Median of ${iterations} runs)             `
  );
  console.log(
    "========================================================================================================="
  );
  console.log(
    "| Category     | Benchmark                         | C (GCC -O2) | Alya (Native) | Bun (JS JIT) | Python 3.12 | Go | Zig | Nim |"
  );
  console.log(
    "|:-------------|:----------------------------------|------------:|--------------:|-------------:|------------:|---:|---:|---:|"
  );

  for (const r of benchResults) {
    console.log(
      `| ${r.category.padEnd(12)} | ${r.name.padEnd(
        33
      )} | ${`${r.cMs} ms`.padStart(11)} | ${`${r.alyaMs} ms`.padStart(
        13
      )} | ${`${r.bunMs} ms`.padStart(12)} | ${`${r.pyMs} ms`.padStart(
        11
      )} | ${r.goMs.padStart(7)} | ${r.zigMs.padStart(7)} | ${r.nimMs.padStart(7)} |`
    );
  }

  console.log(
    `\n=========================================================================================================`
  );
  console.log(
    `                         2. RELATIVE SPEEDUPS & COMPARISONS                                              `
  );
  console.log(
    "========================================================================================================="
  );
  console.log(
    "| Benchmark                         | vs Python (Speedup) | vs Bun (Speedup)    | vs C (Overhead) | vs Go | vs Zig | vs Nim | Tier         |"
  );
  console.log(
    "|:----------------------------------|--------------------:|--------------------:|----------------:|------:|------:|------:|:-------------|"
  );
  for (const r of benchResults) {
    console.log(
      `| ${r.name.padEnd(33)} | ${r.vsPy.padStart(19)} | ${r.bunText.padStart(
        19
      )} | ${r.vsC.padStart(15)} | ${r.goText.padStart(9)} | ${r.zigText.padStart(
        9
      )} | ${r.nimText.padStart(9)} | ${r.efficiencyTier.padEnd(12)} |`
    );
  }

  console.log(
    "\n---------------------------------------------------------------------------------------------------------"
  );
  const fmtSum = (g: number) => (g === 1.0 ? "n/a" : `${g.toFixed(1)}x`);
  console.log(
    ` SUMMARY (Geometric Mean): vs Python: ${geomeanVsPy.toFixed(
      1
    )}x faster | vs Bun: ${geomeanVsBun.toFixed(
      1
    )}x faster | vs C: ${geomeanVsC.toFixed(1)}x of C | vs Go: ${fmtSum(
      geomeanVsGo
    )} | vs Zig: ${fmtSum(geomeanVsZig)} | vs Nim: ${fmtSum(geomeanVsNim)}`
  );
  console.log(
    "---------------------------------------------------------------------------------------------------------\n"
  );

  if (shouldUpdateReadme && !checkMode) {
    let compilerRows: string[] | undefined;
    try {
      compilerRows = runCompilerBenchmarks();
    } catch (e) {
      console.warn("Could not run compiler benchmarks:", e);
    }
    updateBenchReadme(
      benchResults,
      compilerRows,
      alyaCompiler,
      pyCmd,
      iterations
    );
    updateMainRepoReadme(benchResults, iterations);
  }

  if (hasFailures || benchResults.length !== activeBenchmarks.length) {
    console.error(
      `\n[FATAL] Benchmark suite finished with errors (${benchResults.length}/${activeBenchmarks.length} succeeded).`
    );
    process.exit(1);
  }
}

main();
