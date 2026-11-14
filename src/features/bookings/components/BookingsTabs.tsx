import { SegmentedNav } from "@/design-system";

/** "Minhas reservas" and, for managers, "Gestão". */
export function BookingsTabs({
  current,
  manager,
  pending,
}: {
  current: "mine" | "manage";
  manager: boolean;
  /** Bookings waiting for approval (badge on Gestão). */
  pending?: number;
}) {
  if (!manager) return null;
  return (
    <SegmentedNav
      label="Reservas"
      className="mb-5"
      items={[
        {
          label: "Minhas reservas",
          href: "/reservas",
          active: current === "mine",
        },
        {
          label: "Gestão",
          href: "/reservas/gestao",
          active: current === "manage",
          count: pending || undefined,
        },
      ]}
    />
  );
}
