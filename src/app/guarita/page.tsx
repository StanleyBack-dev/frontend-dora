import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Minimize2 } from "lucide-react";
import { buttonClasses } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { GateDesk } from "@/features/gate/components/GateDesk";
import { Wordmark } from "@/features/layout/components/Logo";
import { LogoMark } from "@/features/layout/components/LogoMark";
import { getSessionUser } from "@/server/auth/current-user";
import { loadGateDay } from "@/server/loaders/load-gate";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Portaria" };

// The gate in full screen (/guarita): the Portaria without the app's menus,
// for the phone or tablet at the gate. Only the code field, the QR reader
// and the day's lists, with a way back to the app.
export default async function GateFullScreenPage() {
  const user = await getSessionUser();
  if (user.mustChangePassword) redirect("/primeiro-acesso");

  let body: React.ReactNode;
  if (!can(user, "GUESTS_CHECKIN")) body = <AccessDenied />;
  else if (!user.condominium) body = <NoCondominium user={user} />;
  else {
    const day = await loadGateDay(user.condominium);
    body = (
      <GateDesk guests={day.guests} tickets={day.tickets} events={day.events} />
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-chrome-line bg-chrome px-4 text-chrome-fg sm:px-6">
        <LogoMark className="size-8" />
        <Wordmark tone="light" className="hidden text-[22px] sm:block" />
        <span className="min-w-0 flex-1 truncate text-sm">
          <span className="font-semibold">Portaria</span>
          {user.condominium && (
            <span className="text-chrome-muted">
              {" "}
              · {user.condominium.name}
            </span>
          )}
        </span>
        <Link
          href="/portaria"
          className={buttonClasses("secondary", "sm")}
          aria-label="Sair da tela cheia"
        >
          <Minimize2 aria-hidden className="size-4" />
          <span className="hidden sm:inline">Sair da tela cheia</span>
        </Link>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">{body}</main>
    </div>
  );
}
