import { apiRequest } from "@/shared/lib/api-client";
import type {
  AuthorizePickupInput,
  Parcel,
  ParcelRecipient,
  ParcelToHandOver,
  PickUpParcelInput,
  RegisterParcelInput,
} from "@/shared/contracts/parcels";

export const parcelsClient = {
  register: (input: RegisterParcelInput) =>
    apiRequest<Parcel>("/parcels", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  recipients: (search: string) =>
    apiRequest<ParcelRecipient[]>(
      `/parcels/recipients?search=${encodeURIComponent(search)}`,
    ),

  byCode: (code: string) =>
    apiRequest<ParcelToHandOver>(
      `/parcels/by-code?code=${encodeURIComponent(code)}`,
    ),

  pickUp: (input: PickUpParcelInput) =>
    apiRequest<Parcel>("/parcels/pick-up", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  authorize: (id: string, input: AuthorizePickupInput) =>
    apiRequest<Parcel>(`/parcels/${id}/authorization`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  revokeAuthorization: (id: string) =>
    apiRequest<Parcel>(`/parcels/${id}/authorization`, { method: "DELETE" }),

  returnToSender: (id: string, reason: string) =>
    apiRequest<Parcel>(`/parcels/${id}/return`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  cancel: (id: string, reason: string) =>
    apiRequest<Parcel>(`/parcels/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
