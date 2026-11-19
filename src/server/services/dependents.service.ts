import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  addDependentDocument,
  approveDependentDocument,
  dependentsPageDocument,
  dependentsReviewOverviewDocument,
  myDependentsDocument,
  rejectDependentDocument,
  removeDependentDocument,
} from "@/server/graphql/operations/dependents.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  Dependent,
  DependentReviewFilter,
  DependentReviewOverview,
  DependentInput,
} from "@/shared/contracts/dependents";

export const dependentsService = {
  async mine(token: string): Promise<Dependent[]> {
    const { myDependents } = await backendGraphql(myDependentsDocument, {
      token,
    });
    return myDependents;
  },

  async add(token: string, input: DependentInput): Promise<Dependent> {
    const { addDependent } = await backendGraphql(addDependentDocument, {
      token,
      variables: { input },
    });
    return addDependent;
  },

  async remove(token: string, id: string): Promise<void> {
    await backendGraphql(removeDependentDocument, {
      token,
      variables: { id },
    });
  },

  /** Gestão > Dependentes: a page of the filtered dependents. */
  async page(
    token: string,
    filter: DependentReviewFilter,
    page: { page: number; limit: number },
  ): Promise<Paginated<Dependent>> {
    const { dependentsPage } = await backendGraphql(dependentsPageDocument, {
      token,
      variables: { filter, page },
    });
    return dependentsPage;
  },

  /** Counts by status and the filters' options, whatever the filters. */
  async reviewOverview(token: string): Promise<DependentReviewOverview> {
    const { dependentsReviewOverview } = await backendGraphql(
      dependentsReviewOverviewDocument,
      { token },
    );
    return dependentsReviewOverview;
  },

  async approve(token: string, id: string): Promise<Dependent> {
    const { approveDependent } = await backendGraphql(
      approveDependentDocument,
      { token, variables: { id } },
    );
    return approveDependent;
  },

  async reject(token: string, id: string, reason: string): Promise<Dependent> {
    const { rejectDependent } = await backendGraphql(rejectDependentDocument, {
      token,
      variables: { id, reason },
    });
    return rejectDependent;
  },
};
