import { graphql } from "@/server/graphql/generated";

export const dashboardDocument = graphql(`
  query Dashboard {
    dashboard {
      activeUsers
      pendingEnrollments
      units
      activeSpaces
      pendingBookings
      bookingsToday
      openSupportRequests
      failedNotifications
      parcels {
        waiting
        stuck
        perishableOverdue
        pickedUpLast30Days
        averagePickupHours
        monthly {
          month
          received
          pickedUp
        }
      }
      lostAndFound {
        kept
        pendingClaims
        expiringSoon
        openLostReports
        returnedLast90Days
        returnRate
        monthly {
          month
          found
          returned
        }
      }
    }
  }
`);
