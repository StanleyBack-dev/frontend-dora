"use client";

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";

type FilterTransition = {
  /** A filter was applied and its page is still loading. */
  pending: boolean;
  start: TransitionStartFunction;
};

const FilterTransitionContext = createContext<FilterTransition | null>(null);

// Ties a page's filters to its results: the navigation a filter starts
// (AutoFilterForm) runs in this one transition, so the results
// (FilterResults) can show that they are loading until the new page
// arrives.
export function FilterScope({ children }: { children: ReactNode }) {
  const [pending, start] = useTransition();
  return (
    <FilterTransitionContext.Provider value={{ pending, start }}>
      {children}
    </FilterTransitionContext.Provider>
  );
}

/** The scope's transition, or null outside a FilterScope. */
export const useFilterTransition = () => useContext(FilterTransitionContext);
