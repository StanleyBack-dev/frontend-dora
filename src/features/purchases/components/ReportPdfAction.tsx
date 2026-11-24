import { ReceiptPdfButton } from "@/features/signature/components/ReceiptPdfButton";

/**
 * The period's report as a PDF, in the row under the page header and to
 * the right, as the other pages' main actions (also on a phone).
 */
export function ReportPdfAction({
  path,
  fallbackName,
  label,
}: {
  /** The BFF path of the PDF, with the period's query. */
  path: string;
  fallbackName: string;
  label: string;
}) {
  return (
    <div className="mb-5 flex justify-end">
      <ReceiptPdfButton path={path} fallbackName={fallbackName} label={label} />
    </div>
  );
}
