import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";

export default function ProductNotFound() {
  return (
    <>
      <PageHeader
        title="Produkt"
        crumbs={[{ label: "Produkte", href: "/produkte" }]}
      />
      <Alert title="Das Produkt wurde nicht gefunden" className="max-w-2xl">
        <p>
          Vielleicht wurde es gelöscht.{" "}
          <Link
            href="/produkte"
            className="font-medium underline underline-offset-2"
          >
            Zur Produktliste
          </Link>
        </p>
      </Alert>
    </>
  );
}
