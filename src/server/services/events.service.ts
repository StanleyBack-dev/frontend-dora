import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  cancelEventDocument,
  createEventDocument,
  eventDocument,
  eventsDocument,
  publishEventDocument,
  updateEventDocument,
} from "@/server/graphql/operations/events.operations";
import type {
  CondominiumEvent,
  EventInput,
  EventWhen,
} from "@/shared/contracts/events";

export const eventsService = {
  /** Upcoming or past; managers also get the drafts. */
  async list(token: string, when: EventWhen): Promise<CondominiumEvent[]> {
    const { events } = await backendGraphql(eventsDocument, {
      token,
      variables: { when },
    });
    return events;
  },

  async get(token: string, id: string): Promise<CondominiumEvent> {
    const { event } = await backendGraphql(eventDocument, {
      token,
      variables: { id },
    });
    return event;
  },

  async create(token: string, input: EventInput): Promise<CondominiumEvent> {
    const { createEvent } = await backendGraphql(createEventDocument, {
      token,
      variables: { input },
    });
    return createEvent;
  },

  async update(
    token: string,
    id: string,
    input: EventInput,
  ): Promise<CondominiumEvent> {
    const { updateEvent } = await backendGraphql(updateEventDocument, {
      token,
      variables: { id, input },
    });
    return updateEvent;
  },

  async publish(token: string, id: string): Promise<CondominiumEvent> {
    const { publishEvent } = await backendGraphql(publishEventDocument, {
      token,
      variables: { id },
    });
    return publishEvent;
  },

  async cancel(
    token: string,
    id: string,
    reason: string,
  ): Promise<CondominiumEvent> {
    const { cancelEvent } = await backendGraphql(cancelEventDocument, {
      token,
      variables: { id, reason },
    });
    return cancelEvent;
  },
};
