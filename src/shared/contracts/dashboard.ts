/** Manager's overview (home page). */
export type Dashboard = {
  /** Members of the condominium with access. */
  activeUsers: number;
  /** Sign-ups from the public link waiting for review. */
  pendingEnrollments: number;
  units: number;
  /** Spaces residents can book. */
  activeSpaces: number;
  /** Bookings waiting for a manager's approval. */
  pendingBookings: number;
  /** Active bookings starting today. */
  bookingsToday: number;
  /** Support requests not answered yet (platform only, else null). */
  openSupportRequests: number | null;
  /** Notifications the API gave up sending (platform only, else null). */
  failedNotifications: number | null;
  /** The parcels module's numbers (null: the module is off). */
  parcels: ParcelIndicators | null;
  /** The lost and found module's numbers (null: the module is off). */
  lostAndFound: LostFoundIndicators | null;
};

/** Parcels at a glance (the management dashboard). */
export type ParcelIndicators = {
  /** At the desk now, and for more than 3 days. */
  waiting: number;
  stuck: number;
  /** Perishable, past the pickup deadline. */
  perishableOverdue: number;
  /** Picked up in the last 30 days, and the average hours until then. */
  pickedUpLast30Days: number;
  averagePickupHours: number | null;
  /** The last 6 months, oldest first ("2026-11"). */
  monthly: { month: string; received: number; pickedUp: number }[];
};

/** Lost and found at a glance (the management dashboard). */
export type LostFoundIndicators = {
  /** Kept now; claims waiting; keeping period ending within 7 days. */
  kept: number;
  pendingClaims: number;
  expiringSoon: number;
  /** "Perdi algo" reports still open. */
  openLostReports: number;
  /** Returned in the last 90 days, and the share of what left (0-100). */
  returnedLast90Days: number;
  returnRate: number | null;
  /** The last 6 months, oldest first ("2026-11"). */
  monthly: { month: string; found: number; returned: number }[];
};
