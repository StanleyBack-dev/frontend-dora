import type { Metadata } from "next";
import {
  Alert,
  AutoFilterForm,
  FilterActions,
  FilterCombobox,
  FilterField,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  SegmentedNav,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { BookingsSection } from "@/features/platform-metrics/components/BookingsSection";
import { EngagementSection } from "@/features/platform-metrics/components/EngagementSection";
import { HealthSection } from "@/features/platform-metrics/components/HealthSection";
import { SpacesSection } from "@/features/platform-metrics/components/SpacesSection";
import {
  PERIOD_PRESETS,
  formatPeriodDay,
  periodStart,
} from "@/features/platform-metrics/model/metrics-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { BackendError } from "@/server/http/backend-error";
import { requestTime } from "@/server/request-time";
import { condominiumsService } from "@/server/services/condominiums.service";
import { platformMetricsService } from "@/server/services/platform-metrics.service";
import { can } from "@/shared/lib/access";
import { isDay } from "@/shared/lib/datetime";
import {
  buildHref,
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Painel" };

// The platform administrator's panel: bookings, use of the spaces, residents
// and what needs attention, across every condominium or one of them.
export default async function PlatformPanelPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "CONDOMINIUMS_MANAGE")) return <AccessDenied />;

  const params = await searchParams;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(await requestTime());
  const condominiums = await authed((token) => condominiumsService.list(token));
  const condominiumId = oneOf(
    firstParam(params, "condominio"),
    condominiums.map((item) => item.id),
  );
  const from = firstParam(params, "de");
  const to = firstParam(params, "ate");
  const filter = {
    from: isDay(from) ? from : undefined,
    to: isDay(to) ? to : undefined,
    condominiumId,
  };

  const { metrics, error } = await authed(async (token) => {
    try {
      return {
        metrics: await platformMetricsService.get(token, filter),
        error: null,
      };
    } catch (cause) {
      // An impossible period (future, reversed, longer than a year): say so
      // and show the default period instead.
      if (
        cause instanceof BackendError &&
        cause.code === "METRICS_INVALID_PERIOD"
      ) {
        return {
          metrics: await platformMetricsService.get(token, { condominiumId }),
          error: cause.message,
        };
      }
      throw cause;
    }
  });

  const allCondominiums = !metrics.condominiumId;
  const scopeName = condominiums.find(
    (item) => item.id === condominiumId,
  )?.name;
  const filtered = Boolean(from || to || condominiumId);
  const presetHref = (days: number) =>
    buildHref("/plataforma", {
      de: periodStart(today, days),
      ate: today,
      condominio: condominiumId,
    });

  return (
    <>
      <PageHeader
        title="Painel"
        description={`${scopeName ?? "Todos os condomínios"} · de ${formatPeriodDay(metrics.from)} a ${formatPeriodDay(metrics.to)} (${metrics.days} dia${metrics.days === 1 ? "" : "s"}).`}
      />

      <div className="mb-4">
        <SegmentedNav
          label="Período"
          items={PERIOD_PRESETS.map((preset) => ({
            href: presetHref(preset.days),
            label: preset.label,
            active: metrics.to === today && metrics.days === preset.days,
          }))}
        />
      </div>

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterField
              label="De"
              name="de"
              type="date"
              max={today}
              defaultValue={metrics.from}
            />
            <FilterField
              label="Até"
              name="ate"
              type="date"
              max={today}
              defaultValue={metrics.to}
            />
            <FilterCombobox
              label="Condomínio"
              name="condominio"
              defaultValue={condominiumId ?? ""}
              placeholder="Todos"
              options={condominiums.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
            <FilterActions
              clearHref="/plataforma"
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>
        <FilterResults>
          {error && (
            <div className="mb-6">
              <Alert tone="warning">
                {error} Mostrando os últimos 30 dias.
              </Alert>
            </div>
          )}

          <div className="space-y-10">
            <HealthSection
              health={metrics.health}
              allCondominiums={allCondominiums}
            />
            <BookingsSection
              bookings={metrics.bookings}
              allCondominiums={allCondominiums}
            />
            <SpacesSection
              spaces={metrics.spaces}
              allCondominiums={allCondominiums}
            />
            <EngagementSection
              engagement={metrics.engagement}
              allCondominiums={allCondominiums}
            />
          </div>
        </FilterResults>
      </FilterScope>
    </>
  );
}
