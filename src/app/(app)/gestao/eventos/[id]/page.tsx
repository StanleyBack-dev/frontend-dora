import type { Metadata } from "next";
import { EventDetail } from "@/app/(app)/eventos/[id]/event-detail";

export const metadata: Metadata = { title: "Evento" };

// An event in the management: edit, publish, cancel and the orders.
export default async function ManagedEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <EventDetail id={(await params).id} area="manage" />;
}
