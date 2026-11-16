import type { EventOrder } from "@/shared/contracts/events";

/** Who among the viewer and their dependents already has a ticket. */
export type HeldPeople = {
  self: boolean;
  dependentIds: Set<string>;
  /** Their names, for the note in the order drawer. */
  names: string[];
};

// An order holds its people while it is awaiting review or confirmed, or
// pending while its deadline hasn't passed (the same rule as the API, which
// refuses a second ticket for the same person).
function holds(order: EventOrder, now: number): boolean {
  if (order.status === "AWAITING_REVIEW" || order.status === "CONFIRMED") {
    return true;
  }
  return (
    order.status === "PENDING_PAYMENT" &&
    order.expiresAt !== null &&
    new Date(order.expiresAt).getTime() > now
  );
}

/** The viewer and dependents with a ticket in one of their active orders. */
export function heldPeople(orders: EventOrder[], now: number): HeldPeople {
  const held: HeldPeople = { self: false, dependentIds: new Set(), names: [] };
  for (const order of orders) {
    if (!holds(order, now)) continue;
    for (const person of order.attendees) {
      if (person.source === "SELF" && !held.self) {
        held.self = true;
        held.names.push(person.name);
      }
      if (
        person.source === "DEPENDENT" &&
        person.dependentId &&
        !held.dependentIds.has(person.dependentId)
      ) {
        held.dependentIds.add(person.dependentId);
        held.names.push(person.name);
      }
    }
  }
  return held;
}
