import type { Metadata } from "next";
import { Card, SegmentedNav } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { DependentsReview } from "@/features/dependents/components/DependentsReview";
import { getSessionUser } from "@/server/auth/current-user";
import { loadDependentsForReview } from "@/server/loaders/load-dependents";
import type { DependentStatus } from "@/shared/contracts/dependents";
import { can } from "@/shared/lib/access";
import {
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Dependentes" };

const FILTERS = {
  aprovar: { label: "Para aprovar", status: "PENDING" },
  aprovados: { label: "Aprovados", status: "APPROVED" },
  recusados: { label: "Recusados", status: "REJECTED" },
} as const satisfies Record<string, { label: string; status: DependentStatus }>;
type Filter = keyof typeof FILTERS;
const KEYS = Object.keys(FILTERS) as Filter[];

// The residents' dependents, for the managers to check the documents.
export default async function DependentsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "USERS_MANAGE")) return <AccessDenied />;
  const filter =
    oneOf(firstParam(await searchParams, "situacao"), KEYS) ?? "aprovar";
  const all = await loadDependentsForReview(null);
  const of = (key: Filter) =>
    all.filter((item) => item.status === FILTERS[key].status);
  return (
    <>
      <SegmentedNav
        label="Situação"
        className="mb-4"
        items={KEYS.map((key) => ({
          label: FILTERS[key].label,
          href:
            key === "aprovar"
              ? "/gestao/dependentes"
              : `/gestao/dependentes?situacao=${key}`,
          active: filter === key,
          count: of(key).length,
        }))}
      />
      <Card>
        <DependentsReview dependents={of(filter)} />
      </Card>
    </>
  );
}
