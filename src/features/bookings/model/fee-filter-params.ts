import type { FeeFilter } from "@/shared/contracts/bookings";

/** The fee situations in the address ("situacao"). */
export const FEE_SITUATIONS = { lancadas: true, pendentes: false } as const;
export type FeeSituation = keyof typeof FEE_SITUATIONS;

/** The filters of the usage fees as the address carries them. */
export type FeeFilterParams = {
  unidade?: string;
  espaco?: string;
  morador?: string;
  situacao?: FeeSituation;
};

/** The API filter of what the address chose. */
export const toFeeFilter = (params: FeeFilterParams): FeeFilter => ({
  ...(params.unidade && { unitId: params.unidade }),
  ...(params.espaco && { spaceId: params.espaco }),
  ...(params.morador && { userId: params.morador }),
  ...(params.situacao && { billed: FEE_SITUATIONS[params.situacao] }),
});
