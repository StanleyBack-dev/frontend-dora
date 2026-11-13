/** Manager's overview (home page). */
export type Dashboard = {
  /** Members of the condominium with access. */
  activeUsers: number;
  /** Sign-ups from the public link waiting for review. */
  pendingEnrollments: number;
  units: number;
  /** Support requests not answered yet (platform only, else null). */
  openSupportRequests: number | null;
  /** Notifications the API gave up sending (platform only, else null). */
  failedNotifications: number | null;
};
