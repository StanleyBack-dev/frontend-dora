/** Manager's overview (home page). */
export type Dashboard = {
  /** Enabled accounts. */
  activeUsers: number;
  /** Sign-ups from the public link waiting for review. */
  pendingEnrollments: number;
  /** Support requests not answered yet. */
  openSupportRequests: number;
  /** Notifications the API gave up sending. */
  failedNotifications: number;
};
