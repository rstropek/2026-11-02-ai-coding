// Replaces the products in a data folder with the test data from testdata/.
// Usage: node scripts/reset-data.mjs [target folder, default: data]
// The e2e tests use it to start every run from the same data.
import { cpSync, rmSync } from "node:fs";
import path from "node:path";

const target = path.resolve(process.argv[2] ?? "data");

rmSync(path.join(target, "products"), { recursive: true, force: true });
cpSync("testdata/products", path.join(target, "products"), {
  recursive: true,
});
console.log(`Test data copied to ${target}`);
