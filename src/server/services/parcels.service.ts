import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  cancelParcelDocument,
  parcelByCodeDocument,
  parcelOverviewDocument,
  parcelRecipientsDocument,
  parcelsDocument,
  pickUpParcelDocument,
  registerParcelDocument,
  returnParcelDocument,
} from "@/server/graphql/operations/parcels.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  Parcel,
  ParcelFilter,
  ParcelOverview,
  ParcelRecipient,
  ParcelToHandOver,
  PickUpParcelInput,
  RegisterParcelInput,
} from "@/shared/contracts/parcels";

/** Which page of a list, and how many per page. */
type PageRequest = { page: number; limit: number };

export const parcelsService = {
  /** The condominium's parcels (gate, administration), filtered by the API. */
  async list(
    token: string,
    filter: ParcelFilter,
    page: PageRequest,
  ): Promise<Paginated<Parcel>> {
    const { parcels } = await backendGraphql(parcelsDocument, {
      token,
      variables: { filter, page },
    });
    return parcels;
  },

  async overview(token: string): Promise<ParcelOverview> {
    const { parcelOverview } = await backendGraphql(parcelOverviewDocument, {
      token,
    });
    return parcelOverview;
  },

  /** The parcel of a pickup code, with the declaration to sign. */
  async byCode(token: string, code: string): Promise<ParcelToHandOver> {
    const { parcelByCode } = await backendGraphql(parcelByCodeDocument, {
      token,
      variables: { code },
    });
    return parcelByCode;
  },

  /** Residents (with a unit) by part of the name, for registering. */
  async recipients(token: string, search: string): Promise<ParcelRecipient[]> {
    const { parcelRecipients } = await backendGraphql(
      parcelRecipientsDocument,
      { token, variables: { search } },
    );
    return parcelRecipients;
  },

  async register(token: string, input: RegisterParcelInput): Promise<Parcel> {
    const { registerParcel } = await backendGraphql(registerParcelDocument, {
      token,
      variables: { input },
    });
    return registerParcel;
  },

  async pickUp(token: string, input: PickUpParcelInput): Promise<Parcel> {
    const { pickUpParcel } = await backendGraphql(pickUpParcelDocument, {
      token,
      variables: { input },
    });
    return pickUpParcel;
  },

  async returnToSender(
    token: string,
    id: string,
    reason: string,
  ): Promise<Parcel> {
    const { returnParcel } = await backendGraphql(returnParcelDocument, {
      token,
      variables: { id, reason },
    });
    return returnParcel;
  },

  async cancel(token: string, id: string, reason: string): Promise<Parcel> {
    const { cancelParcel } = await backendGraphql(cancelParcelDocument, {
      token,
      variables: { id, reason },
    });
    return cancelParcel;
  },
};
