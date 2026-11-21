import { graphql } from "@/server/graphql/generated";

export const lostReportFieldsFragment = graphql(`
  fragment LostReportFields on LostReport {
    id
    userId
    userName
    unitId
    unitLabel
    category
    title
    description
    lostLocation
    lostOn
    photoUrl
    shared
    spotCount
    status
    foundItemId
    closedAt
    createdAt
  }
`);

export const myLostReportsDocument = graphql(`
  query MyLostReports($page: PageInput) {
    myLostReports(page: $page) {
      items {
        ...LostReportFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const lostReportsDocument = graphql(`
  query LostReports($open: Boolean, $page: PageInput) {
    lostReports(open: $open, page: $page) {
      items {
        ...LostReportFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const reportLostItemDocument = graphql(`
  mutation ReportLostItem($input: ReportLostItemInput!) {
    reportLostItem(input: $input) {
      ...LostReportFields
    }
  }
`);

export const closeLostReportDocument = graphql(`
  mutation CloseLostReport($id: ID!, $found: Boolean!) {
    closeLostReport(id: $id, found: $found) {
      ...LostReportFields
    }
  }
`);

export const lostReportBoardDocument = graphql(`
  query LostReportBoard($page: PageInput) {
    lostReportBoard(page: $page) {
      items {
        id
        category
        title
        lostLocation
        lostOn
        photoUrl
        mine
        spottedByMe
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const spotLostReportDocument = graphql(`
  mutation SpotLostReport($id: ID!, $note: String) {
    spotLostReport(id: $id, note: $note)
  }
`);
