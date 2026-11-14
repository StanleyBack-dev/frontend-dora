/** How the bookings series groups the period. */
export type MetricsGranularity = "DAY" | "WEEK" | "MONTH";

export type BookingsPoint = {
  /** First day of the bucket (YYYY-MM-DD). */
  bucket: string;
  total: number;
  cancelled: number;
};

export type SpaceUsage = {
  spaceId: string;
  name: string;
  condominiumName: string;
  bookings: number;
  hours: number;
};

/** The platform panel (Painel): numbers across condominiums in a period. */
export type PlatformMetrics = {
  from: string;
  to: string;
  days: number;
  condominiumId: string | null;
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    rejected: number;
    /** Pending for more than 48 hours (now, not in the period). */
    stalePending: number;
    granularity: MetricsGranularity;
    series: BookingsPoint[];
    byCondominium: {
      condominiumId: string;
      name: string;
      total: number;
      cancelled: number;
    }[];
  };
  spaces: {
    activeSpaces: number;
    mostUsed: SpaceUsage[];
    unused: SpaceUsage[];
    unusedCount: number;
    /** 0 = Sunday … 6 = Saturday. */
    byWeekday: { weekday: number; bookings: number }[];
    byHour: { hour: number; bookings: number }[];
  };
  engagement: {
    members: number;
    active7d: number;
    active30d: number;
    newMembers: number;
    enrollments: number;
    inactiveCondominiums: {
      condominiumId: string;
      name: string;
      lastActivityAt: string | null;
    }[];
    inactiveCount: number;
  };
  health: {
    staleEnrollments: number;
    failedNotifications: number;
    delayedNotifications: number;
    withoutManager: number;
    withoutUnits: number;
    openSupport: number;
  };
};

export type PlatformMetricsFilter = {
  from?: string;
  to?: string;
  condominiumId?: string;
};
