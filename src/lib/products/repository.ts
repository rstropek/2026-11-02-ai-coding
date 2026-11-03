import { randomUUID } from "node:crypto";
import {
  access,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { isValidId, type Product, productSchema } from "./schema";

// File-based persistence for products: one JSON file per product, named after
// its ID, in <DATA_DIR>/products. In production DATA_DIR is a volume mount
// (host folder or Azure Files share), so data survives container restarts.
// Every read validates the file with the Zod schema.

export class ProductExistsError extends Error {
  constructor(readonly id: string) {
    super(`Product ${id} already exists`);
    this.name = "ProductExistsError";
  }
}

export class ProductNotFoundError extends Error {
  constructor(readonly id: string) {
    super(`Product ${id} does not exist`);
    this.name = "ProductNotFoundError";
  }
}

/** A product file that cannot be parsed or does not match the schema. */
export class InvalidProductFileError extends Error {
  constructor(
    readonly file: string,
    reason: string,
  ) {
    super(`Invalid product file ${file}: ${reason}`);
    this.name = "InvalidProductFileError";
  }
}

export type ProductList = {
  /** Valid products, sorted by ID. */
  products: Product[];
  /** File names that were skipped because they are not valid products. */
  invalidFiles: string[];
};

/** Folder with the product files. Relative DATA_DIR values resolve against the working directory. */
export function productsDir(): string {
  // The data folder is not part of the build output, so it is not traced.
  return path.join(
    path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || "data"),
    "products",
  );
}

const fileName = (id: string) => `${id}.json`;
const filePath = (id: string) => path.join(productsDir(), fileName(id));

function isErrnoException(
  error: unknown,
  code: string,
): error is NodeJS.ErrnoException {
  return (
    error instanceof Error && (error as NodeJS.ErrnoException).code === code
  );
}

async function readProductFile(file: string): Promise<Product> {
  let json: unknown;
  try {
    json = JSON.parse(await readFile(path.join(productsDir(), file), "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new InvalidProductFileError(file, "not valid JSON");
    }
    throw error;
  }

  const result = productSchema.safeParse(json);
  if (!result.success) {
    const reasons = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new InvalidProductFileError(file, reasons);
  }
  if (fileName(result.data.id) !== file) {
    throw new InvalidProductFileError(
      file,
      `contains ID ${result.data.id}, expected ${path.basename(file, ".json")}`,
    );
  }
  return result.data;
}

/** Reads and validates all products. Invalid files are skipped and reported. */
export async function listProducts(): Promise<ProductList> {
  let entries: string[];
  try {
    entries = await readdir(productsDir());
  } catch (error) {
    if (isErrnoException(error, "ENOENT")) {
      return { products: [], invalidFiles: [] };
    }
    throw error;
  }

  // Dot files are temporary files of a write in progress (see writeAtomically).
  const files = entries
    .filter((name) => name.endsWith(".json") && !name.startsWith("."))
    .sort();
  const products: Product[] = [];
  const invalidFiles: string[] = [];
  for (const file of files) {
    try {
      products.push(await readProductFile(file));
    } catch (error) {
      if (!(error instanceof InvalidProductFileError)) {
        throw error;
      }
      console.error(error.message);
      invalidFiles.push(file);
    }
  }
  products.sort((a, b) => a.id.localeCompare(b.id, "de"));
  return { products, invalidFiles };
}

/** Reads one product. Returns undefined if it does not exist. */
export async function getProduct(id: string): Promise<Product | undefined> {
  if (!isValidId(id)) {
    return undefined;
  }
  try {
    return await readProductFile(fileName(id));
  } catch (error) {
    if (isErrnoException(error, "ENOENT")) {
      return undefined;
    }
    throw error;
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

// The app runs as a single instance, so serializing writes in the process is
// enough to make "create only if new" and "update only if present" reliable.
let writeQueue: Promise<unknown> = Promise.resolve();

function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
}

// Readers never see a half-written file: write a temporary file next to the
// target, then rename it, which replaces the target in one step.
async function writeAtomically(product: Product): Promise<void> {
  const dir = productsDir();
  await mkdir(dir, { recursive: true });
  const temp = path.join(dir, `.${product.id}.${randomUUID()}.tmp`);
  try {
    await writeFile(temp, `${JSON.stringify(product, null, 2)}\n`, "utf8");
    await rename(temp, filePath(product.id));
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
}

function validated(product: Product): Product {
  // Callers pass parsed data, but writing is the last line of defense
  // against files the next read would reject.
  return productSchema.parse(product);
}

/** Stores a new product. Throws ProductExistsError if the ID is taken. */
export async function createProduct(product: Product): Promise<Product> {
  const data = validated(product);
  return serialized(async () => {
    if (await exists(filePath(data.id))) {
      throw new ProductExistsError(data.id);
    }
    await writeAtomically(data);
    return data;
  });
}

/** Replaces an existing product, including all features. */
export async function updateProduct(product: Product): Promise<Product> {
  const data = validated(product);
  return serialized(async () => {
    if (!(await exists(filePath(data.id)))) {
      throw new ProductNotFoundError(data.id);
    }
    await writeAtomically(data);
    return data;
  });
}

/** Deletes a product. Throws ProductNotFoundError if it does not exist. */
export function deleteProduct(id: string): Promise<void> {
  return serialized(async () => {
    if (!isValidId(id)) {
      throw new ProductNotFoundError(id);
    }
    try {
      await unlink(filePath(id));
    } catch (error) {
      if (isErrnoException(error, "ENOENT")) {
        throw new ProductNotFoundError(id);
      }
      throw error;
    }
  });
}
