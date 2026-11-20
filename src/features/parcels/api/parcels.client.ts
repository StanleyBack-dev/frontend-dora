import { apiDownload, apiRequest } from "@/shared/lib/api-client";
import type {
  Parcel,
  ParcelRecipient,
  ParcelToHandOver,
  PickUpParcelInput,
  RegisterParcelInput,
} from "@/shared/contracts/parcels";

export const parcelsClient = {
  /** The pickup receipt as a PDF file. */
  receiptPdf: (id: string) => apiDownload(`/parcels/${id}/receipt`),

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
