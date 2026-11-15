export type SupportRankingEntry = {
  /** Equal totals share the position. */
  position: number;
  /** Null: the supporter chose not to show the name. */
  name: string | null;
  totalCents: number;
  contributions: number;
};

/** "Apoie o Dora" ranking: all time (year null) or one year. */
export type SupportRanking = {
  year: number | null;
  supporters: number;
  totalCents: number;
  entries: SupportRankingEntry[];
};

export type SupportContribution = {
  id: string;
  amountCents: number;
  /** YYYY-MM-DD. */
  receivedOn: string;
  note: string | null;
};

/** For the platform administrator: hidden names included. */
export type Supporter = {
  id: string;
  name: string;
  showName: boolean;
  totalCents: number;
  contributions: number;
  lastReceivedOn: string | null;
  history: SupportContribution[];
};

export type SupportContributionInput = {
  name: string;
  showName: boolean;
  amountCents: number;
  receivedOn: string;
  note: string | null;
};

export type SupporterInput = { name: string; showName: boolean };
