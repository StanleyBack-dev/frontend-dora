import { ReceiptPdfButton } from "@/features/parcels/components/ReceiptPdfButton";
import { SignatureReceiptView } from "@/features/signature/components/SignatureReceiptView";
import type { ParcelReceipt } from "@/shared/contracts/parcels";

// The pickup receipt of a parcel, with its PDF.
export function ParcelReceiptView({
  parcelId,
  receipt,
}: {
  parcelId: string;
  receipt: ParcelReceipt;
}) {
  return (
    <SignatureReceiptView
      title="Comprovante de retirada"
      signerLabel="Quem retirou"
      receipt={receipt}
      actions={<ReceiptPdfButton parcelId={parcelId} />}
    />
  );
}
