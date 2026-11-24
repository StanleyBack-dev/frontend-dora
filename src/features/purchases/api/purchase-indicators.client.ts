import { apiRequest } from "@/shared/lib/api-client";
import type { TransparencyStatus } from "@/shared/contracts/purchase-indicators";

/** Publishing the purchases accounts, from the browser (through the BFF). */
export const purchaseIndicatorsClient = {
  publish: (enabled: boolean) =>
    apiRequest<TransparencyStatus>("/purchases/transparency", {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    }),
};
