"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, Tag } from "lucide-react";
import { Button } from "@/design-system";
import { BrandForm } from "@/features/catalog/components/BrandForm";
import { ProductForm } from "@/features/catalog/components/ProductForm";

// The page's main action: register a product (or a brand), on its own row,
// to the right, as on the other module pages.
export function CatalogDeskActions({ kind }: { kind: "product" | "brand" }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const done = () => {
    setCreating(false);
    router.refresh();
  };

  return (
    <div className="mb-5 flex justify-end">
      <Button
        icon={
          kind === "product" ? (
            <PackagePlus className="size-4" />
          ) : (
            <Tag className="size-4" />
          )
        }
        onClick={() => setCreating(true)}
      >
        {kind === "product" ? "Cadastrar produto" : "Cadastrar marca"}
      </Button>
      {creating && kind === "product" && (
        <ProductForm onClose={() => setCreating(false)} onDone={done} />
      )}
      {creating && kind === "brand" && (
        <BrandForm onClose={() => setCreating(false)} onDone={done} />
      )}
    </div>
  );
}
