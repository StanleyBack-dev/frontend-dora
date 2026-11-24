"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Power, PowerOff, Truck } from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Modal,
  type DataTableColumn,
} from "@/design-system";
import { CopyShareValue } from "@/features/admin/components/CopyShareValue";
import { suppliersClient } from "@/features/suppliers/api/suppliers.client";
import { CategoriesFold } from "@/features/catalog/components/CategoriesFold";
import { SupplierFormDrawer } from "@/features/suppliers/components/SupplierFormDrawer";
import {
  maskSupplierDocument,
  ratingLabel,
} from "@/features/suppliers/model/supplier-labels";
import type { Supplier } from "@/shared/contracts/suppliers";
import { errorMessage } from "@/shared/lib/api-client";
import { formatPhone } from "@/shared/lib/masks";
import { formatPixKey, PIX_KEY_TYPE_LABELS } from "@/shared/lib/pix-key";
import { useToast } from "@/shared/toast/useToast";

/** "Hidráulica Central" (trade name) over "Hidráulica Central Ltda". */
const displayName = (supplier: Supplier) => supplier.tradeName ?? supplier.name;

/** A value of the details with a copy button (a dash when empty). */
const copyable = (value: string | null, label: string) =>
  value ? <CopyShareValue value={value} label={label} share={false} /> : "—";

/**
 * The condominium's suppliers (Compras > Fornecedores): name and status;
 * the document, contact, PIX and notes (each with a copy button) and what
 * they serve (its own folding block) open below the row. The buttons
 * follow Espaços and Equipe:
 * "Editar" (primary) opens the same drawer as registering; "Desativar"
 * (danger, asked first) keeps the history; "Reativar" is secondary.
 */
export function SuppliersTable({
  suppliers,
  filtered,
}: {
  suppliers: Supplier[];
  filtered: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [toggling, setToggling] = useState<Supplier | null>(null);
  const [pending, setPending] = useState(false);
  const deactivating = toggling?.active ?? false;

  async function toggleActive() {
    if (!toggling) return;
    setPending(true);
    try {
      await suppliersClient.setSupplierActive(toggling.id, !toggling.active);
      showSuccess(
        toggling.active ? "Fornecedor desativado." : "Fornecedor reativado.",
      );
      setToggling(null);
      router.refresh();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível alterar o fornecedor."));
    } finally {
      setPending(false);
    }
  }

  if (suppliers.length === 0) {
    return (
      <EmptyState
        icon={<Truck className="size-5" />}
        title={
          filtered ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor ainda"
        }
        description={
          filtered
            ? "Tente outro nome, contato, documento, categoria ou situação, ou limpe os filtros."
            : "Cadastre quem o condomínio contrata ou de quem compra para usar nas cotações."
        }
      />
    );
  }

  const columns: DataTableColumn<Supplier>[] = [
    {
      key: "supplier",
      label: "Fornecedor",
      mobile: "title",
      render: (supplier) => (
        <span className="block truncate font-medium text-fg">
          {displayName(supplier)}
        </span>
      ),
    },
    /**
     * Desktop: columns of the row. Phones: the legal name is the card's
     * subtitle and the document goes to the details.
     */
    {
      key: "name",
      label: "Razão social",
      mobile: "subtitle",
      renderMobile: (supplier) => supplier.name,
      render: (supplier) => copyable(supplier.name, "Razão social"),
    },
    {
      key: "document",
      label: "CNPJ/CPF",
      className: "whitespace-nowrap",
      render: (supplier) =>
        copyable(
          maskSupplierDocument(supplier.documentType, supplier.document),
          supplier.documentType,
        ),
    },
    {
      key: "rating",
      label: "Avaliação",
      className: "whitespace-nowrap",
      render: (supplier) =>
        ratingLabel(supplier) ?? <span className="text-soft">—</span>,
    },
    {
      key: "status",
      label: "Situação",
      render: (supplier) => (
        <Badge tone={supplier.active ? "success" : "neutral"}>
          {supplier.active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "contact",
      label: "Contato",
      desktop: "detail",
      render: (supplier) => copyable(supplier.contactName, "Contato"),
    },
    {
      key: "phone",
      label: "Telefone",
      desktop: "detail",
      render: (supplier) =>
        copyable(
          supplier.phone ? formatPhone(supplier.phone) : null,
          "Telefone",
        ),
    },
    {
      key: "email",
      label: "E-mail",
      desktop: "detail",
      render: (supplier) => copyable(supplier.email, "E-mail"),
    },
    {
      key: "city",
      label: "Cidade",
      desktop: "detail",
      render: (supplier) =>
        copyable(
          supplier.city
            ? `${supplier.city}${supplier.state ? `/${supplier.state}` : ""}`
            : supplier.state,
          "Cidade",
        ),
    },
    {
      key: "pix",
      label: "PIX",
      desktop: "detail",
      render: (supplier) =>
        supplier.pixKeyType && supplier.pixKey ? (
          <span className="inline-flex max-w-full items-center gap-1.5">
            <span className="shrink-0 text-soft">
              {PIX_KEY_TYPE_LABELS[supplier.pixKeyType]}:
            </span>
            <CopyShareValue
              value={formatPixKey(supplier.pixKeyType, supplier.pixKey)}
              label="Chave PIX"
              share={false}
            />
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "notes",
      label: "Observações",
      desktop: "detail",
      render: (supplier) => copyable(supplier.notes, "Observações"),
    },
    {
      key: "categories",
      label: "Atende",
      desktop: "detail",
      render: (supplier) => <CategoriesFold value={supplier} />,
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "detail",
      render: (supplier) => (
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          <Button
            size="sm"
            variant="primary"
            icon={<Pencil className="size-4" />}
            onClick={() => setEditing(supplier)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant={supplier.active ? "danger" : "secondary"}
            icon={
              supplier.active ? (
                <PowerOff className="size-4" />
              ) : (
                <Power className="size-4" />
              )
            }
            onClick={() => setToggling(supplier)}
          >
            {supplier.active ? "Desativar" : "Reativar"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        rows={suppliers}
        columns={columns}
        getId={(supplier) => supplier.id}
      />

      {editing && (
        <SupplierFormDrawer
          key={editing.id}
          open
          supplier={editing}
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
        title={deactivating ? "Desativar fornecedor" : "Reativar fornecedor"}
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
          ? `${toggling ? displayName(toggling) : "O fornecedor"} deixa de aparecer nas novas cotações. O histórico continua guardado e você pode reativar quando quiser.`
          : `${toggling ? displayName(toggling) : "O fornecedor"} volta a aparecer nas novas cotações.`}
      </Modal>
    </>
  );
}
