// Compiles styles.src.css into the static styles.css for the click dummy.
// Uses the Tailwind packages the app already depends on, so no extra tooling
// is needed. Run from anywhere: node mockups/produktverwaltung/build-css.mjs
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compile, optimize } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

const base = dirname(fileURLToPath(import.meta.url));
const input = join(base, "styles.src.css");
const css = await readFile(input, "utf8");

const compiler = await compile(css, { base, from: input, onDependency() {} });
const scanner = new Scanner({ sources: compiler.sources });
const output = optimize(compiler.build(scanner.scan()), { minify: false }).code;

await writeFile(join(base, "styles.css"), output);
console.log(`styles.css written (${output.length} bytes)`);
