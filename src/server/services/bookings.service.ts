import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  addBookingGuestsDocument,
  approveBookingDocument,
  bookingFeesDocument,
  bookingGuestsDocument,
  cancelBookingSeriesDocument,
  checkInGuestDocument,
  condominiumSpaceBlocksDocument,
  createBookingSeriesDocument,
  gateGuestsDocument,
  guestInviteDocument,
  joinWaitlistDocument,
  leaveWaitlistDocument,
  removeBookingGuestDocument,
  setBookingFeesBilledDocument,
  undoGuestCheckInDocument,
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
  BookingFees,
  BookingGuest,
  BookingSeriesResult,
  GateGuest,
  GuestInput,
  GuestInvite,
  SeriesCancellation,
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

  /** Every space's current and upcoming blocks (managers). */
  async allBlocks(token: string): Promise<SpaceBlock[]> {
    const { condominiumSpaceBlocks } = await backendGraphql(
      condominiumSpaceBlocksDocument,
      { token },
    );
    return condominiumSpaceBlocks;
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

  // === weekly series ===

  async createSeries(
    token: string,
    input: {
      spaceId: string;
      startsAt: string;
      weeks: number;
      notes: string | null;
    },
  ): Promise<BookingSeriesResult> {
    const { createBookingSeries } = await backendGraphql(
      createBookingSeriesDocument,
      { token, variables: { input } },
    );
    return createBookingSeries;
  },

  async cancelSeries(
    token: string,
    seriesId: string,
  ): Promise<SeriesCancellation> {
    const { cancelBookingSeries } = await backendGraphql(
      cancelBookingSeriesDocument,
      { token, variables: { seriesId } },
    );
    return cancelBookingSeries;
  },

  // === waiting list ===

  async joinWaitlist(
    token: string,
    input: { spaceId: string; startsAt: string },
  ): Promise<void> {
    await backendGraphql(joinWaitlistDocument, { token, variables: { input } });
  },

  async leaveWaitlist(
    token: string,
    input: { spaceId: string; startsAt: string },
  ): Promise<void> {
    await backendGraphql(leaveWaitlistDocument, {
      token,
      variables: { input },
    });
  },

  // === guests ===

  async guests(token: string, bookingId: string): Promise<BookingGuest[]> {
    const { bookingGuests } = await backendGraphql(bookingGuestsDocument, {
      token,
      variables: { bookingId },
    });
    return bookingGuests;
  },

  async addGuests(
    token: string,
    bookingId: string,
    guests: GuestInput[],
  ): Promise<BookingGuest[]> {
    const { addBookingGuests } = await backendGraphql(
      addBookingGuestsDocument,
      { token, variables: { input: { bookingId, guests } } },
    );
    return addBookingGuests;
  },

  async removeGuest(token: string, id: string): Promise<void> {
    await backendGraphql(removeBookingGuestDocument, {
      token,
      variables: { id },
    });
  },

  /** Public: the invite page (null: no such code). */
  async invite(code: string): Promise<GuestInvite | null> {
    const { guestInvite } = await backendGraphql(guestInviteDocument, {
      variables: { code },
    });
    return guestInvite ?? null;
  },

  // === the gate (Portaria) ===

  async gateGuests(token: string, date?: string): Promise<GateGuest[]> {
    const { gateGuests } = await backendGraphql(gateGuestsDocument, {
      token,
      variables: { date: date ?? null },
    });
    return gateGuests;
  },

  async checkIn(
    token: string,
    target: { guestId?: string | null; code?: string | null },
  ): Promise<GateGuest> {
    const { checkInGuest } = await backendGraphql(checkInGuestDocument, {
      token,
      variables: { input: target },
    });
    return checkInGuest;
  },

  async undoCheckIn(token: string, guestId: string): Promise<GateGuest> {
    const { undoGuestCheckIn } = await backendGraphql(
      undoGuestCheckInDocument,
      { token, variables: { guestId } },
    );
    return undoGuestCheckIn;
  },

  // === usage fees ===

  async fees(token: string, month?: string): Promise<BookingFees> {
    const { bookingFees } = await backendGraphql(bookingFeesDocument, {
      token,
      variables: { month: month ?? null },
    });
    return bookingFees;
  },

  async setFeesBilled(
    token: string,
    bookingIds: string[],
    billed: boolean,
  ): Promise<number> {
    const { setBookingFeesBilled } = await backendGraphql(
      setBookingFeesBilledDocument,
      { token, variables: { input: { bookingIds, billed } } },
    );
    return setBookingFeesBilled;
  },
};
