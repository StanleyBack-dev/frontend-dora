import type { Metadata } from "next";
import { CatalogListPage } from "@/app/(app)/compras/_catalog/catalog-list-page";
import type { RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Marcas" };

/** Compras > Marcas (the catalog shared by the modules). */
export default function Page({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return <CatalogListPage kind="brand" searchParams={searchParams} />;
}
