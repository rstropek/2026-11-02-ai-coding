import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProductList } from "@/components/products/product-list";
import { Alert } from "@/components/ui/alert";
import { FlashToast } from "@/components/ui/flash-toast";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonRows } from "@/components/ui/skeleton";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { listProducts } from "@/lib/products/repository";
import { flashMessage } from "./flash";

export const metadata: Metadata = { title: "Produkte" };

export default function ProductsPage({ searchParams }: PageProps<"/produkte">) {
  return (
    <>
      <PageHeader
        title="Produkte"
        description="Alle Produkte mit ihren freischaltbaren Features, Preisen und Verfügbarkeit."
        actions={
          <Link href="/produkte/neu" className={buttonClass("primary")}>
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            Produkt anlegen
          </Link>
        }
      />
      <Suspense
        fallback={
          <div className={`${cardClass} overflow-hidden`}>
            <SkeletonRows rows={5} />
          </div>
        }
      >
        <Products searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Products({
  searchParams,
}: Pick<PageProps<"/produkte">, "searchParams">) {
  // Product files change at runtime, so read them on every request.
  await connection();
  const [{ products, invalidFiles }, params] = await Promise.all([
    listProducts(),
    searchParams,
  ]);
  return (
    <>
      <FlashToast message={flashMessage(params)} />
      {invalidFiles.length > 0 && (
        <Alert
          tone="warning"
          title="Nicht alle Produkte können angezeigt werden"
          className="mb-4"
        >
          <p>
            {invalidFiles.length === 1
              ? "Diese Produktdatei ist"
              : "Diese Produktdateien sind"}{" "}
            ungültig und {invalidFiles.length === 1 ? "wird" : "werden"} nicht
            angezeigt:{" "}
            <span className="font-mono">{invalidFiles.join(", ")}</span>. Bitte
            lassen Sie die {invalidFiles.length === 1 ? "Datei" : "Dateien"} vom
            IT-Support prüfen.
          </p>
        </Alert>
      )}
      <ProductList products={products} />
    </>
  );
}
