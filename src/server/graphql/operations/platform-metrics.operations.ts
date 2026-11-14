import { graphql } from "@/server/graphql/generated";

export const platformMetricsDocument = graphql(`
  query PlatformMetrics($filter: PlatformMetricsFilterInput) {
    platformMetrics(filter: $filter) {
      from
      to
      days
      condominiumId
      bookings {
        total
        confirmed
        pending
        cancelled
        rejected
        stalePending
        granularity
        series {
          bucket
          total
          cancelled
        }
        byCondominium {
          condominiumId
          name
          total
          cancelled
        }
      }
      spaces {
        activeSpaces
        unusedCount
        mostUsed {
          spaceId
          name
          condominiumName
          bookings
          hours
        }
        unused {
          spaceId
          name
          condominiumName
          bookings
          hours
        }
        byWeekday {
          weekday
          bookings
        }
        byHour {
          hour
          bookings
        }
      }
      engagement {
        members
        active7d
        active30d
        newMembers
        enrollments
        inactiveCount
        inactiveCondominiums {
          condominiumId
          name
          lastActivityAt
        }
      }
      health {
        staleEnrollments
        failedNotifications
        delayedNotifications
        withoutManager
        withoutUnits
        openSupport
      }
    }
  }
`);
