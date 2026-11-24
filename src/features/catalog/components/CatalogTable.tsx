"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Pencil, Power, PowerOff, Tag } from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Modal,
  type DataTableColumn,
} from "@/design-system";
import { catalogClient } from "@/features/catalog/api/catalog.client";
import { BrandForm } from "@/features/catalog/components/BrandForm";
import { ProductForm } from "@/features/catalog/components/ProductForm";
import type { Brand, Product } from "@/shared/contracts/catalog";
import { errorMessage } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

type Row = Product | Brand;
const isProduct = (row: Row): row is Product => "unit" in row;

/**
 * The catalog's products (or brands): name, unit (products) and status;
 * the description opens below the row. "Editar" (primary) opens the same
 * modal as registering; "Desativar" (danger, asked first) keeps the
 * history; "Reativar" is secondary, as on Fornecedores.
 */
export function CatalogTable({
  kind,
  rows,
  filtered,
}: {
  kind: "product" | "brand";
  rows: Row[];
  filtered: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [editing, setEditing] = useState<Row | null>(null);
  const [toggling, setToggling] = useState<Row | null>(null);
  const [pending, setPending] = useState(false);
  const products = kind === "product";
  const deactivating = toggling?.active ?? false;
  const noun = products ? "produto" : "marca";

  async function toggleActive() {
    if (!toggling) return;
    setPending(true);
    try {
      if (products) {
        await catalogClient.setProductActive(toggling.id, !toggling.active);
      } else {
        await catalogClient.setBrandActive(toggling.id, !toggling.active);
      }
      showSuccess(
        products
          ? toggling.active
            ? "Produto desativado."
            : "Produto reativado."
          : toggling.active
            ? "Marca desativada."
            : "Marca reativada.",
      );
      setToggling(null);
      router.refresh();
    } catch (cause) {
      showError(
        errorMessage(
          cause,
          `Não foi possível alterar ${products ? "o produto" : "a marca"}.`,
        ),
      );
    } finally {
      setPending(false);
    }
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={
          products ? <Package className="size-5" /> : <Tag className="size-5" />
        }
        title={
          filtered
            ? products
              ? "Nenhum produto encontrado"
              : "Nenhuma marca encontrada"
            : products
              ? "Nenhum produto ainda"
              : "Nenhuma marca ainda"
        }
        description={
          filtered
            ? "Tente outro nome ou situação, ou limpe os filtros."
            : `Cadastre aqui ou com o “+” ao preencher um item de uma solicitação de compra.`
        }
      />
    );
  }

  const columns: DataTableColumn<Row>[] = [
    {
      key: "name",
      label: products ? "Produto" : "Marca",
      mobile: "title",
      render: (row) => <span className="font-medium text-fg">{row.name}</span>,
    },
    ...(products
      ? [
          {
            key: "unit",
            label: "Unidade",
            mobile: "subtitle" as const,
            render: (row: Row) => (isProduct(row) ? row.unit : "—"),
          },
        ]
      : []),
    {
      key: "status",
      label: "Situação",
      render: (row) => (
        <Badge tone={row.active ? "success" : "neutral"}>
          {row.active
            ? products
              ? "Ativo"
              : "Ativa"
            : products
              ? "Inativo"
              : "Inativa"}
        </Badge>
      ),
    },
    ...(products
      ? [
          {
            key: "description",
            label: "Descrição",
            desktop: "detail" as const,
            render: (row: Row) =>
              (isProduct(row) ? row.description : null) ?? "—",
          },
        ]
      : []),
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "detail",
      render: (row) => (
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          <Button
            size="sm"
            variant="primary"
            icon={<Pencil className="size-4" />}
            onClick={() => setEditing(row)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant={row.active ? "danger" : "secondary"}
            icon={
              row.active ? (
                <PowerOff className="size-4" />
              ) : (
                <Power className="size-4" />
              )
            }
            onClick={() => setToggling(row)}
          >
            {row.active ? "Desativar" : "Reativar"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable rows={rows} columns={columns} getId={(row) => row.id} />

      {editing && isProduct(editing) && (
        <ProductForm
          key={editing.id}
          product={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {editing && !isProduct(editing) && (
        <BrandForm
          key={editing.id}
          brand={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      <Modal
        open={toggling !== null}
        onClose={() => setToggling(null)}
        title={`${deactivating ? "Desativar" : "Reativar"} ${noun}`}
        tone={deactivating ? "danger" : "neutral"}
        busy={pending}
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setToggling(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              variant={deactivating ? "danger" : "primary"}
              onClick={toggleActive}
              loading={pending}
            >
              {deactivating ? "Desativar" : "Reativar"}
            </Button>
          </>
        }
      >
        {deactivating
          ? `“${toggling?.name}” deixa de aparecer nos novos itens das solicitações. As solicitações que já ${products ? "o" : "a"} usam continuam iguais.`
          : `“${toggling?.name}” volta a aparecer nos novos itens das solicitações.`}
      </Modal>
    </>
  );
}
