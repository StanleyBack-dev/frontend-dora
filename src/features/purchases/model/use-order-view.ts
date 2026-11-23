"use client";

import { useCallback, useRef, useState } from "react";
import { purchaseOrdersClient } from "@/features/purchases/api/purchase-orders.client";
import type { PurchaseOrderView } from "@/shared/contracts/purchase-orders";
import { errorMessage } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

/**
 * Loads a purchase's order page data on demand (a list button opening a
 * drawer): `prefetch` starts fetching it (on hover or focus) so `load`
 * opens at once; `view` holds it until `clear`, which also drops the
 * fetched copy (the next open reads it fresh).
 */
export function useOrderView(requestId: string) {
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<PurchaseOrderView | null>(null);
  const fetched = useRef<Promise<PurchaseOrderView | null> | null>(null);

  const fetchView = useCallback(() => {
    fetched.current ??= purchaseOrdersClient.view(requestId).catch(() => {
      fetched.current = null;
      return null;
    });
    return fetched.current;
  }, [requestId]);

  const prefetch = useCallback(() => void fetchView(), [fetchView]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setView(
        (await fetchView()) ?? (await purchaseOrdersClient.view(requestId)),
      );
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível abrir o pedido."));
    } finally {
      setLoading(false);
    }
  }, [fetchView, requestId, showError]);

  const clear = useCallback(() => {
    fetched.current = null;
    setView(null);
  }, []);

  return { view, loading, load, prefetch, clear };
}
