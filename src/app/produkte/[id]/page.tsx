import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  AvailabilityToggle,
  DeleteProduct,
} from "@/components/products/product-actions";
import {
  editHref,
  FeatureSection,
  ProductFacts,
} from "@/components/products/product-detail";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import { FlashToast } from "@/components/ui/flash-toast";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonRows } from "@/components/ui/skeleton";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { getProduct } from "@/lib/products/repository";
import { deleteProductAction, setAvailabilityAction } from "../actions";
import { flashMessage } from "../flash";

export async function generateMetadata({
  params,
}: PageProps<"/produkte/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: id };
}

export default function ProductPage({
  params,
  searchParams,
}: PageProps<"/produkte/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader
            title="Produkt"
            crumbs={[{ label: "Produkte", href: "/produkte" }]}
          />
          <div className={`${cardClass} overflow-hidden`}>
            <SkeletonRows rows={4} />
          </div>
        </>
      }
    >
      <ProductDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductDetail({
  params,
  searchParams,
}: PageProps<"/produkte/[id]">) {
  await connection();
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    notFound();
  }

  return (
    <>
      <FlashToast message={flashMessage(await searchParams)} />
      <PageHeader
        title={product.id}
        crumbs={[
          { label: "Produkte", href: "/produkte" },
          { label: product.id },
        ]}
        badge={<AvailabilityBadge available={product.available} />}
        description={product.description}
        actions={
          <>
            <AvailabilityToggle
              id={product.id}
              available={product.available}
              setAvailability={setAvailabilityAction}
            />
            <Link href={editHref(product)} className={buttonClass("primary")}>
              <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
              Bearbeiten
            </Link>
          </>
        }
      />
      <div className="flex flex-col gap-8">
        <ProductFacts product={product} />
        <FeatureSection product={product} />
        <DeleteProduct
          id={product.id}
          featureCount={product.features.length}
          deleteProduct={deleteProductAction}
        />
      </div>
    </>
  );
}
