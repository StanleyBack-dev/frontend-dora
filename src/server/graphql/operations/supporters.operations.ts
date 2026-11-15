import { graphql } from "@/server/graphql/generated";

export const supportRankingDocument = graphql(`
  query SupportRanking($year: Int) {
    supportRanking(year: $year) {
      year
      supporters
      totalCents
      entries {
        position
        name
        totalCents
        contributions
      }
    }
  }
`);

export const supportersDocument = graphql(`
  query Supporters {
    supporters {
      id
      name
      showName
      totalCents
      contributions
      lastReceivedOn
      history {
        id
        amountCents
        receivedOn
        note
      }
    }
  }
`);

export const recordSupportContributionDocument = graphql(`
  mutation RecordSupportContribution($input: RecordSupportContributionInput!) {
    recordSupportContribution(input: $input) {
      id
    }
  }
`);

export const updateSupporterDocument = graphql(`
  mutation UpdateSupporter($id: ID!, $input: UpdateSupporterInput!) {
    updateSupporter(id: $id, input: $input) {
      id
    }
  }
`);

export const deleteSupporterDocument = graphql(`
  mutation DeleteSupporter($id: ID!) {
    deleteSupporter(id: $id)
  }
`);

export const deleteSupportContributionDocument = graphql(`
  mutation DeleteSupportContribution($id: ID!) {
    deleteSupportContribution(id: $id)
  }
`);
