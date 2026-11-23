import type { DataTableColumn } from "@/design-system";

/**
 * The request's whole name among the details a phone card opens (its header
 * cuts it); hidden on larger screens, where the column shows it.
 */
export const fullTitleColumn = <T>(
  title: (row: T) => string,
): DataTableColumn<T> => ({
  key: "title",
  label: "Solicitação",
  desktop: "hidden",
  render: (row) => title(row),
});
