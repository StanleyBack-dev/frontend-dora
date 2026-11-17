import type { Metadata } from "next";
import { EventDetail } from "./event-detail";

export const metadata: Metadata = { title: "Evento" };

// An event for the resident: how to get in, the order and the tickets.
export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <EventDetail id={(await params).id} area="app" />;
}
