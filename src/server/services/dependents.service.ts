import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  addDependentDocument,
  approveDependentDocument,
  dependentsDocument,
  myDependentsDocument,
  rejectDependentDocument,
  removeDependentDocument,
} from "@/server/graphql/operations/dependents.operations";
import type {
  Dependent,
  DependentInput,
  DependentStatus,
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

  async forReview(
    token: string,
    status: DependentStatus | null,
  ): Promise<Dependent[]> {
    const { dependents } = await backendGraphql(dependentsDocument, {
      token,
      variables: { status },
    });
    return dependents;
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
