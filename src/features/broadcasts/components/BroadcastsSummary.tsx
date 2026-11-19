import { CalendarDays, Mail, Megaphone, Users } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { BroadcastStats } from "@/shared/contracts/broadcasts";

// The numbers of the broadcasts (counted by the API): all sent, the last 30
// days, how many people they reached in those days, and how many also went
// by e-mail.
export function BroadcastsSummary({ stats }: { stats: BroadcastStats }) {
  return (
    <StatGrid>
      <StatCard
        label="Comunicados"
        value={String(stats.total)}
        icon={<Megaphone />}
      />
      <StatCard
        label="Últimos 30 dias"
        value={String(stats.recent)}
        icon={<CalendarDays />}
        tone="info"
      />
      <StatCard
        label="Pessoas alcançadas"
        value={String(stats.recentRecipients)}
        hint="nos últimos 30 dias"
        icon={<Users />}
        tone="success"
      />
      <StatCard
        label="Com e-mail"
        value={String(stats.withEmail)}
        icon={<Mail />}
        tone="neutral"
      />
    </StatGrid>
  );
}
