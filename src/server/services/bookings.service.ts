import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  approveBookingDocument,
  bookingsDocument,
  cancelBookingDocument,
  createBookingDocument,
  createSpaceBlockDocument,
  deleteSpaceBlockDocument,
  myBookingsDocument,
  rejectBookingDocument,
  spaceAvailabilityDocument,
  spaceBlocksDocument,
} from "@/server/graphql/operations/bookings.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  Booking,
  BookingStatus,
  BookingWhen,
  SpaceAvailability,
  SpaceBlock,
  SpaceBlockInput,
} from "@/shared/contracts/bookings";

export type BookingListQuery = {
  spaceId?: string;
  status?: BookingStatus;
  when?: BookingWhen;
  page: number;
  limit: number;
};

export const bookingsService = {
  async mine(
    token: string,
    when: BookingWhen,
    page: { page: number; limit: number },
  ): Promise<Paginated<Booking>> {
    const { myBookings } = await backendGraphql(myBookingsDocument, {
      token,
      variables: { when, page },
    });
    return myBookings;
  },

  async all(
    token: string,
    query: BookingListQuery,
  ): Promise<Paginated<Booking>> {
    const { bookings } = await backendGraphql(bookingsDocument, {
      token,
      variables: {
        filter: {
          spaceId: query.spaceId,
          status: query.status,
          when: query.when,
        },
        page: { page: query.page, limit: query.limit },
      },
    });
    return bookings;
  },

  async availability(
    token: string,
    spaceId: string,
    date: string,
  ): Promise<SpaceAvailability> {
    const { spaceAvailability } = await backendGraphql(
      spaceAvailabilityDocument,
      { token, variables: { spaceId, date } },
    );
    return spaceAvailability;
  },

  async create(
    token: string,
    input: { spaceId: string; startsAt: string; notes: string | null },
  ): Promise<Booking> {
    const { createBooking } = await backendGraphql(createBookingDocument, {
      token,
      variables: { input },
    });
    return createBooking;
  },

  async cancel(
    token: string,
    id: string,
    reason: string | null,
  ): Promise<Booking> {
    const { cancelBooking } = await backendGraphql(cancelBookingDocument, {
      token,
      variables: { id, reason },
    });
    return cancelBooking;
  },

  async approve(token: string, id: string): Promise<Booking> {
    const { approveBooking } = await backendGraphql(approveBookingDocument, {
      token,
      variables: { id },
    });
    return approveBooking;
  },

  async reject(token: string, id: string, reason: string): Promise<Booking> {
    const { rejectBooking } = await backendGraphql(rejectBookingDocument, {
      token,
      variables: { id, reason },
    });
    return rejectBooking;
  },

  async blocks(token: string, spaceId: string): Promise<SpaceBlock[]> {
    const { spaceBlocks } = await backendGraphql(spaceBlocksDocument, {
      token,
      variables: { spaceId },
    });
    return spaceBlocks;
  },

  async createBlock(
    token: string,
    spaceId: string,
    input: SpaceBlockInput,
  ): Promise<void> {
    await backendGraphql(createSpaceBlockDocument, {
      token,
      variables: { input: { ...input, spaceId } },
    });
  },

  async deleteBlock(token: string, id: string): Promise<void> {
    await backendGraphql(deleteSpaceBlockDocument, {
      token,
      variables: { id },
    });
  },
};
