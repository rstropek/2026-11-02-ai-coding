import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonRows } from "@/components/ui/skeleton";
import { cardClass } from "@/components/ui/styles";
import { knownTags } from "@/lib/products/known-tags";
import { getProduct, listProducts } from "@/lib/products/repository";
import { saveProductAction } from "../../actions";

export async function generateMetadata({
  params,
}: PageProps<"/produkte/[id]/bearbeiten">): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id} bearbeiten` };
}

export default function EditProductPage(
  props: PageProps<"/produkte/[id]/bearbeiten">,
) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader
            title="Produkt bearbeiten"
            crumbs={[{ label: "Produkte", href: "/produkte" }]}
          />
          <div className={`${cardClass} max-w-2xl overflow-hidden`}>
            <SkeletonRows rows={6} />
          </div>
        </>
      }
    >
      <EditProduct {...props} />
    </Suspense>
  );
}

async function EditProduct({
  params,
  searchParams,
}: PageProps<"/produkte/[id]/bearbeiten">) {
  await connection();
  const { id } = await params;
  const [product, { products }, { feature }] = await Promise.all([
    getProduct(id),
    listProducts(),
    searchParams,
  ]);
  if (!product) {
    notFound();
  }
  const detailHref = `/produkte/${encodeURIComponent(product.id)}`;

  return (
    <>
      <PageHeader
        title="Produkt bearbeiten"
        crumbs={[
          { label: "Produkte", href: "/produkte" },
          { label: product.id, href: detailHref },
          { label: "Bearbeiten" },
        ]}
        description="Ändern Sie Stammdaten, Links, Tags und Features. Alles wird gemeinsam gespeichert."
      />
      <ProductForm
        product={product}
        knownTags={knownTags(products)}
        initialFeature={typeof feature === "string" ? feature : undefined}
        cancelHref={detailHref}
        saveAction={saveProductAction}
      />
    </>
  );
}
