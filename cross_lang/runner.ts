import { spawnSync } from "child_process";
import { performance } from "perf_hooks";
import * as fs from "fs";
import * as path from "path";

interface BenchConfig {
    id: string;
    name: string;
    category: "Algorithms" | "Collections" | "Numeric" | "Strings";
    displayName: string;
    rootDisplayName: string;
    workload: string;
    expected: string;
    suite: "standard" | "comprehensive";
    alyaSrc: string;
    cSrc: string;
    pySrc: string;
    jsSrc: string;
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
        jsSrc: "cross_lang/algorithms/fibonacci.js"
    },
    {
        id: "quicksort",
        name: "In-Place Quicksort (50,000 items)",
        category: "Algorithms",
        displayName: "**In-Place Quicksort**",
        rootDisplayName: "**Quicksort (50k items)**",
        workload: "50,000 items in-place sort",
        expected: "1475860",
        suite: "comprehensive",
        alyaSrc: "cross_lang/algorithms/quicksort.alya",
        cSrc: "cross_lang/algorithms/quicksort.c",
        pySrc: "cross_lang/algorithms/quicksort.py",
        jsSrc: "cross_lang/algorithms/quicksort.js"
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
        jsSrc: "cross_lang/algorithms/sieve.js"
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
        jsSrc: "cross_lang/collections/binary_trees.js"
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
        jsSrc: "cross_lang/collections/hash_map.js"
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
        jsSrc: "cross_lang/numeric/mandelbrot.js"
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
        jsSrc: "cross_lang/numeric/matrix_mult.js"
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
        jsSrc: "cross_lang/strings/str_hash.js"
    }
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

function getAlyaCompiler(): string {
    const exeExt = process.platform === "win32" ? ".exe" : "";

    // 1. Env variable ALYA_COMPILER
    if (process.env.ALYA_COMPILER && fs.existsSync(process.env.ALYA_COMPILER)) {
        return path.resolve(process.env.ALYA_COMPILER);
    }

    // 2. Local bin or target/release/alyac
    const localTarget = path.resolve(`target/release/alyac${exeExt}`);
    if (fs.existsSync(localTarget)) return localTarget;

    // 3. Sibling repo targets
    const siblingTargets = [
        path.resolve(__dirname, `../../Src/alya/target/release/alyac${exeExt}`),
        path.resolve(__dirname, `../../../Src/alya/target/release/alyac${exeExt}`),
        path.resolve(__dirname, `../../alya/target/release/alyac${exeExt}`)
    ];
    for (const st of siblingTargets) {
        if (fs.existsSync(st)) return st;
    }

    // 4. In PATH
    try {
        const res = spawnSync(`alyac${exeExt}`, ["--version"], { encoding: "utf-8" });
        if (res.status === 0) {
            return `alyac${exeExt}`;
        }
    } catch {}

    return `alyac${exeExt}`;
}

function ensureAlyaCompiler(): string {
    const compiler = getAlyaCompiler();
    try {
        const res = spawnSync(compiler, ["--version"], { encoding: "utf-8" });
        if (res.status === 0) {
            return compiler;
        }
    } catch {}

    if (fs.existsSync(path.resolve("Cargo.toml"))) {
        console.log("Compiling Alya compiler in release mode (`cargo build --release`)...");
        const buildRes = spawnSync("cargo", ["build", "--release"], { stdio: "inherit" });
        if (buildRes.status === 0) {
            const localTarget = path.resolve(`target/release/alyac${process.platform === "win32" ? ".exe" : ""}`);
            if (fs.existsSync(localTarget)) return localTarget;
        }
    }

    console.error(`[ERROR] Alya compiler (alyac) not found or not executable.`);
    console.error(`Please install alyac into your PATH or set the ALYA_COMPILER environment variable.`);
    console.error(`Example: export ALYA_COMPILER=/path/to/alyac`);
    process.exit(1);
}

function getPythonCmd(): string {
    const candidates = process.platform === "win32" ? ["python", "py", "python3"] : ["python3", "python"];
    for (const cmd of candidates) {
        try {
            const r = spawnSync(cmd, ["--version"], { encoding: "utf-8" });
            if (r.status === 0) return cmd;
        } catch {}
    }
    return "python";
}

function runCommand(cmd: string, args: string[]): { durationMs: number; output: string; status: number } {
    const t0 = performance.now();
    const res = spawnSync(cmd, args, { encoding: "utf-8" });
    const durationMs = performance.now() - t0;
    const output = (res.stdout || "").trim();
    return { durationMs, output, status: res.status ?? -1 };
}

function measureMedian(cmd: string, args: string[], iters = 5): { median: number; min: number; max: number; output: string } {
    // Warmup
    runCommand(cmd, args);

    const times: number[] = [];
    let lastOutput = "";

    for (let i = 0; i < iters; i++) {
        const { durationMs, output, status } = runCommand(cmd, args);
        if (status !== 0) {
            console.error(`Command failed: ${cmd} ${args.join(" ")}`);
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

function getTestEnvironment(alyaCompiler: string, pyCmd: string, iters: number): { os: string; gcc: string; bun: string; python: string; alya: string; methodology: string } {
    let osName = "Windows 11 Pro x64";
    if (process.platform === "win32") {
        osName = "Windows 11 Pro x64";
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
        const res = spawnSync("gcc", ["--version"], { encoding: "utf-8" });
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

    let alyaVer = "0.0.7";
    try {
        const res = spawnSync(alyaCompiler, ["--version"], { encoding: "utf-8" });
        const match = (res.stdout || "").match(/alyac\s+([0-9.]+)/);
        if (match) {
            alyaVer = match[1];
        } else if (fs.existsSync(path.resolve("Cargo.toml"))) {
            const cargo = fs.readFileSync(path.resolve("Cargo.toml"), "utf-8");
            const cargoMatch = cargo.match(/version\s*=\s*"([^"]+)"/);
            if (cargoMatch) alyaVer = cargoMatch[1];
        }
    } catch {}

    const methodology = `1 warmup run, followed by ${iters} timed runs. Median execution time reported.`;

    return { os: osName, gcc: gccVer, bun: bunVer, python: pyVer, alya: alyaVer, methodology };
}

function runCompilerBenchmarks(): string[] {
    let cargoDir: string | null = null;
    if (fs.existsSync(path.resolve("Cargo.toml"))) {
        cargoDir = path.resolve(".");
    } else {
        const siblings = [
            path.resolve(__dirname, "../../Src/alya"),
            path.resolve(__dirname, "../../../Src/alya"),
            path.resolve("../alya")
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

    console.log(`Running compiler throughput benchmarks in ${cargoDir} (\`cargo bench --bench compiler_bench\`)...`);
    const res = spawnSync("cargo", ["bench", "--bench", "compiler_bench"], { cwd: cargoDir, encoding: "utf-8" });
    if (res.status !== 0) {
        return [];
    }
    const output = (res.stdout || "") + "\n" + (res.stderr || "");
    const rows: string[] = [];

    const lines = output.split("\n");
    for (const line of lines) {
        if (!line.includes("|") || line.includes("Benchmark Stage") || line.includes(":-")) {
            continue;
        }
        const parts = line.split("|").map(p => p.trim()).filter(p => p.length > 0);
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
            rows.push(`| **\`${stage}\`** | ${iters} | \`${avg}\` | \`${min}\` | \`${max}\` | **${throughput}** |`);
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
    cMs: string;
    alyaMs: string;
    bunMs: string;
    pyMs: string;
    vsC: string;
    vsPy: string;
    vsBunMarkdown: string;
    bunText: string;
    pyText: string;
}

function findReadmePath(): string | null {
    const candidates = [
        path.resolve("README.md"),
        path.resolve(__dirname, "../README.md"),
        path.resolve("benchmarks/README.md")
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

function updateBenchReadme(results: DetailedBenchResult[], compilerRows?: string[], alyaCompiler: string = "alyac", pyCmd: string = "python", iters: number = 5) {
    const readmePath = findReadmePath();
    if (!readmePath) {
        console.error("Cannot find README.md to update.");
        return;
    }
    let content = fs.readFileSync(readmePath, "utf-8");

    // 1. Update Test Environment
    const env = getTestEnvironment(alyaCompiler, pyCmd, iters);
    const envBlock = `### Test Environment\n* **Operating System:** ${env.os}\n* **C Compiler:** ${env.gcc}\n* **JavaScript Engine:** ${env.bun}\n* **Python Runtime:** ${env.python}\n* **Alya Version:** ${env.alya} (Compiled with \`alyac build\` in Release mode)\n* **Measurement Methodology:** ${env.methodology}`;
    content = content.replace(/### Test Environment[\s\S]*?(?=\r?\n\r?\n---)/, envBlock);

    // 2. Update Scoreboard Table with Category Column
    const tableHeader = "| Category | Benchmark | Target Workload | C (GCC -O2) | Alya (Native) | Bun (JS JIT) | Python 3.12 | Alya vs C | Alya vs Python | Alya vs Bun |\n| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |";
    const scoreboardRows = results.map(r =>
        `| \`${r.category}\` | ${r.displayName} | ${r.workload} | \`${r.cMs} ms\` | **\`${r.alyaMs} ms\`** | \`${r.bunMs} ms\` | \`${r.pyMs} ms\` | **${r.vsC}** | **${r.vsPy}** | ${r.vsBunMarkdown} |`
    );
    const newTable = `### Benchmark Scoreboard\n\n${tableHeader}\n${scoreboardRows.join("\n")}`;
    content = content.replace(/### Benchmark Scoreboard[\s\S]*?(?=\r?\n\r?\n---)/, newTable);

    // 3. Update Benchmark Details & Insights Result lines
    const detailReplacements: { id: string; regex: RegExp }[] = [
        {
            id: "fib",
            regex: /(### 1\. Recursive Fibonacci[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/
        },
        {
            id: "mandelbrot",
            regex: /(### 2\. Mandelbrot Fractal[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/
        },
        {
            id: "sieve",
            regex: /(### 3\. Sieve of Eratosthenes[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/
        },
        {
            id: "str_hash",
            regex: /(### 4\. FNV-1a String Hashing[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/
        },
        {
            id: "quicksort",
            regex: /(### 5\. In-Place Quicksort[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/
        },
        {
            id: "binary_trees",
            regex: /(### 6\. Binary Trees[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/
        },
        {
            id: "matrix_mult",
            regex: /(### 7\. Matrix Multiplication[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/
        },
        {
            id: "hash_map",
            regex: /(### 8\. Hash Map Operations[\s\S]*?\*\s*\*\*Result:\*\*)[^\r\n]*/
        }
    ];

    for (const rep of detailReplacements) {
        const item = results.find(d => d.id === rep.id);
        if (item) {
            content = content.replace(rep.regex, `$1 **${item.vsC} of C (-O2)**, **${item.bunText}**, and **${item.pyText}**.`);
        }
    }

    // 4. Update Compiler Throughput Table (if available)
    if (compilerRows && compilerRows.length > 0) {
        const compilerHeader = "| Benchmark Stage | Iterations | Mean | Error | StdDev | Min | Max | Allocated | Alloc Ratio | Measured Throughput |\n| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |";
        const newCompilerTable = `${compilerHeader}\n${compilerRows.join("\n")}`;
        content = content.replace(/\| Benchmark Stage \| Iterations \|[\s\S]*?(?=\r?\n\r?\n---)/, newCompilerTable);
    }

    fs.writeFileSync(readmePath, content, "utf-8");
    console.log(`[INFO] Successfully updated ${readmePath} with latest benchmark results.`);
}

function updateMainRepoReadme(results: DetailedBenchResult[], iters: number = 5) {
    const candidates = [
        process.env.MAIN_REPO_README,
        path.resolve(__dirname, "../../Src/alya/README.md"),
        path.resolve(__dirname, "../../../Src/alya/README.md"),
        path.resolve("../alya/README.md")
    ].filter((p): p is string => Boolean(p && fs.existsSync(p)));

    if (candidates.length === 0) return;

    const rootReadmePath = candidates[0];
    let content = fs.readFileSync(rootReadmePath, "utf-8");

    const header = "| Category | Benchmark | C (GCC -O2) | Alya (Native) | Bun (JS JIT) | Python 3.12 | Alya vs Bun | Alya vs Python |\n| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |";
    const rows = results.map(r =>
        `| \`${r.category}\` | ${r.rootDisplayName} | \`${r.cMs} ms\` | **\`${r.alyaMs} ms\`** | \`${r.bunMs} ms\` | \`${r.pyMs} ms\` | ${r.vsBunMarkdown} | **${r.vsPy}** |`
    );
    const newSection = `### Cross-Language Execution Benchmark (Median of ${iters} runs)\n\n${header}\n${rows.join("\n")}`;

    content = content.replace(/### Cross-Language Execution Benchmark[\s\S]*?(?=\r?\n\r?\n>)/, newSection);

    fs.writeFileSync(rootReadmePath, content, "utf-8");
    console.log(`[INFO] Successfully updated main repo ${rootReadmePath} with latest benchmark results.`);
}

async function main() {
    const shouldUpdateReadme = process.argv.includes("--update-readme");

    // Suite selection: standard | comprehensive | all
    let suiteMode = "comprehensive";
    const suiteIdx = process.argv.indexOf("--suite");
    if (suiteIdx !== -1 && process.argv[suiteIdx + 1]) {
        suiteMode = process.argv[suiteIdx + 1].toLowerCase();
    }

    // Category selection: algorithms | collections | numeric | strings | all
    let categoryFilter = "all";
    const catIdx = process.argv.indexOf("--category") !== -1
        ? process.argv.indexOf("--category")
        : process.argv.indexOf("-c");
    if (catIdx !== -1 && process.argv[catIdx + 1]) {
        categoryFilter = process.argv[catIdx + 1].toLowerCase();
    }

    // Iterations: default 5
    let iterations = 5;
    const iterIdx = process.argv.indexOf("--iterations") !== -1
        ? process.argv.indexOf("--iterations")
        : process.argv.indexOf("-i");
    if (iterIdx !== -1 && process.argv[iterIdx + 1]) {
        const parsed = parseInt(process.argv[iterIdx + 1], 10);
        if (!isNaN(parsed) && parsed > 0) iterations = parsed;
    }

    const activeBenchmarks = BENCHMARKS.filter(b => {
        if (categoryFilter !== "all" && b.category.toLowerCase() !== categoryFilter) {
            return false;
        }
        if (suiteMode === "standard") return b.suite === "standard";
        return true;
    });

    console.log("=========================================================================================");
    console.log("             CROSS-LANGUAGE PERFORMANCE BENCHMARK SUITE                                ");
    console.log("             Alya vs C (GCC -O2) vs Bun (JavaScript JIT) vs Python 3.12                 ");
    console.log(`             Suite: ${suiteMode.toUpperCase()} | Category: ${categoryFilter.toUpperCase()} (${activeBenchmarks.length} benchmarks) | Iterations: ${iterations}`);
    console.log("=========================================================================================\n");

    const alyaCompiler = ensureAlyaCompiler();
    const exeExt = process.platform === "win32" ? ".exe" : "";
    const pyCmd = getPythonCmd();
    const benchResults: DetailedBenchResult[] = [];

    for (const b of activeBenchmarks) {
        process.stdout.write(`Benchmarking [${b.category}] ${b.name}... `);

        const alyaSrcPath = resolveBenchPath(b.alyaSrc);
        const cSrcPath = resolveBenchPath(b.cSrc);
        const jsSrcPath = resolveBenchPath(b.jsSrc);
        const pySrcPath = resolveBenchPath(b.pySrc);

        // 1. Compile Alya to binary
        const alyaExe = alyaSrcPath.replace(/\.alya$/, `_alya${exeExt}`);
        const alyaBuild = spawnSync(alyaCompiler, ["build", alyaSrcPath, "-o", alyaExe], { encoding: "utf-8" });
        if (alyaBuild.status !== 0) {
            console.error(`\nFailed to compile ${alyaSrcPath}:\n${alyaBuild.stderr}`);
            continue;
        }

        // 2. Compile C with GCC -O2
        const cExe = cSrcPath.replace(/\.c$/, `_c${exeExt}`);
        const cBuild = spawnSync("gcc", ["-O2", cSrcPath, "-o", cExe], { encoding: "utf-8" });
        if (cBuild.status !== 0) {
            console.error(`\nFailed to compile ${cSrcPath}:\n${cBuild.stderr}`);
            try { fs.unlinkSync(alyaExe); } catch {}
            continue;
        }

        // Run C
        const cRes = measureMedian(cExe, [], iterations);
        // Run Alya
        const alyaRes = measureMedian(alyaExe, [], iterations);
        // Run Bun (JS)
        const bunRes = measureMedian("bun", ["run", jsSrcPath], iterations);
        // Run Python
        const pyRes = measureMedian(pyCmd, [pySrcPath], iterations);

        // Cleanup binaries
        try { fs.unlinkSync(alyaExe); } catch {}
        try { fs.unlinkSync(cExe); } catch {}

        // Validation
        const allMatch = [cRes.output, alyaRes.output, bunRes.output, pyRes.output].every(o => o.includes(b.expected));
        if (!allMatch) {
            console.warn(`\n[WARNING] Output mismatch for ${b.name}! Expected ${b.expected}`);
            console.warn(`C: ${cRes.output} | Alya: ${alyaRes.output} | Bun: ${bunRes.output} | Py: ${pyRes.output}`);
        }

        const alyaVsC = (alyaRes.median / cRes.median).toFixed(1) + "x";
        const alyaVsPy = (pyRes.median / alyaRes.median).toFixed(1) + "x faster";
        const alyaVsBun = alyaRes.median <= bunRes.median
            ? `**${(bunRes.median / alyaRes.median).toFixed(1)}x faster**`
            : `\`${(alyaRes.median / bunRes.median).toFixed(1)}x slower\``;

        const bunText = alyaRes.median <= bunRes.median
            ? `${(bunRes.median / alyaRes.median).toFixed(1)}x faster than Bun`
            : `${(alyaRes.median / bunRes.median).toFixed(1)}x slower than Bun`;

        const pyText = `${(pyRes.median / alyaRes.median).toFixed(1)}x faster than Python`;

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
            cMs: cRes.median.toFixed(1),
            alyaMs: alyaRes.median.toFixed(1),
            bunMs: bunRes.median.toFixed(1),
            pyMs: pyRes.median.toFixed(1),
            vsC: alyaVsC,
            vsPy: alyaVsPy,
            vsBunMarkdown: alyaVsBun,
            bunText,
            pyText
        });

        console.log("Done.");
    }

    console.log(`\n=========================================================================================================`);
    console.log(`                               BENCHMARK RESULTS (Median of ${iterations} runs)                      `);
    console.log("=========================================================================================================");
    console.log(
        "| Category     | Benchmark                         | C (GCC -O2) | Alya (Native) | Bun (JS JIT) | Python 3.12 | vs C (Ratio) | vs Python (Speedup) |"
    );
    console.log(
        "|:-------------|:----------------------------------|------------:|--------------:|-------------:|------------:|-------------:|--------------------:|"
    );

    for (const r of benchResults) {
        console.log(
            `| ${r.category.padEnd(12)} | ${r.name.padEnd(33)} | ${(`${r.cMs} ms`).padStart(11)} | ${(`${r.alyaMs} ms`).padStart(13)} | ${(`${r.bunMs} ms`).padStart(12)} | ${(`${r.pyMs} ms`).padStart(11)} | ${r.vsC.padStart(12)} | ${r.vsPy.padStart(19)} |`
        );
    }
    console.log("=========================================================================================================\n");

    if (shouldUpdateReadme) {
        let compilerRows: string[] | undefined;
        try {
            compilerRows = runCompilerBenchmarks();
        } catch (e) {
            console.warn("Could not run compiler benchmarks:", e);
        }
        updateBenchReadme(benchResults, compilerRows, alyaCompiler, pyCmd, iterations);
        updateMainRepoReadme(benchResults, iterations);
    }
}

main();
