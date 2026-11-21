import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  closeLostReportDocument,
  lostReportBoardDocument,
  lostReportsDocument,
  myLostReportsDocument,
  reportLostItemDocument,
  spotLostReportDocument,
} from "@/server/graphql/operations/lost-reports.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  LostReport,
  LostReportBoardItem,
  ReportLostItemInput,
} from "@/shared/contracts/lost-and-found";

/** Which page of a list, and how many per page. */
type PageRequest = { page: number; limit: number };

// "Perdi algo": what people lost (theirs, and every one for the desk).
export const lostReportsService = {
  /** The caller's reports, open first. */
  async mine(token: string, page: PageRequest): Promise<Paginated<LostReport>> {
    const { myLostReports } = await backendGraphql(myLostReportsDocument, {
      token,
      variables: { page },
    });
    return myLostReports;
  },

  /** The condominium's reports (desk): open ones, or closed ones. */
  async list(
    token: string,
    open: boolean,
    page: PageRequest,
  ): Promise<Paginated<LostReport>> {
    const { lostReports } = await backendGraphql(lostReportsDocument, {
      token,
      variables: { open, page },
    });
    return lostReports;
  },

  /** The neighbours' board: shared open reports, without who. */
  async board(
    token: string,
    page: PageRequest,
  ): Promise<Paginated<LostReportBoardItem>> {
    const { lostReportBoard } = await backendGraphql(lostReportBoardDocument, {
      token,
      variables: { page },
    });
    return lostReportBoard;
  },

  /** "Achei isso": the owner and the desk are told. */
  async spot(token: string, id: string, note: string | null): Promise<void> {
    await backendGraphql(spotLostReportDocument, {
      token,
      variables: { id, note },
    });
  },

  async report(token: string, input: ReportLostItemInput): Promise<LostReport> {
    const { reportLostItem } = await backendGraphql(reportLostItemDocument, {
      token,
      variables: { input },
    });
    return reportLostItem;
  },

  /** Ends the caller's report: got it back (found) or gave up. */
  async close(token: string, id: string, found: boolean): Promise<LostReport> {
    const { closeLostReport } = await backendGraphql(closeLostReportDocument, {
      token,
      variables: { id, found },
    });
    return closeLostReport;
  },
};
