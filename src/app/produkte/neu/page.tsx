import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonRows } from "@/components/ui/skeleton";
import { cardClass } from "@/components/ui/styles";
import { knownTags } from "@/lib/products/known-tags";
import { listProducts } from "@/lib/products/repository";
import { saveProductAction } from "../actions";

export const metadata: Metadata = { title: "Produkt anlegen" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader
        title="Produkt anlegen"
        crumbs={[{ label: "Produkte", href: "/produkte" }, { label: "Neu" }]}
        description="Legen Sie Stammdaten und Features an. Alles wird gemeinsam gespeichert."
      />
      <Suspense
        fallback={
          <div className={`${cardClass} max-w-2xl overflow-hidden`}>
            <SkeletonRows rows={6} />
          </div>
        }
      >
        <NewProductForm />
      </Suspense>
    </>
  );
}

async function NewProductForm() {
  await connection();
  const { products } = await listProducts();
  return (
    <ProductForm
      knownTags={knownTags(products)}
      cancelHref="/produkte"
      saveAction={saveProductAction}
    />
  );
}
