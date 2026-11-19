import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  createUserDocument,
  memberFilterOptionsDocument,
  memberStatsDocument,
  resetUserPasswordDocument,
  revokeUserSessionsDocument,
  setUserActiveDocument,
  setUserPermissionsDocument,
  unlockUserDocument,
  updateUserDocument,
  userDocument,
  recordStampDocument,
  userPermissionsDocument,
  usersDocument,
} from "@/server/graphql/operations/admin.operations";
import type {
  Paginated,
  Permission,
  PermissionMatrix,
  MemberFilterOption,
  MemberStats,
  RecordStamp,
  TemporaryAccess,
  UserAccount,
  MemberKind,
  UserGroup,
  UserInput,
} from "@/shared/contracts/api";

export type UserListQuery = {
  limit?: number;
  search?: string;
  /** Exactly this person (the name filter). */
  userId?: string;
  /** Exactly this e-mail. */
  email?: string;
  /** Exactly this phone (digits). */
  phone?: string;
  group?: UserGroup;
  /** Residents (Moradores) or employees (Equipe). */
  kind?: MemberKind;
  unitId?: string;
  active?: boolean;
  page: number;
};

const PAGE_SIZE = 20;

export const adminService = {
  async listUsers(
    token: string,
    query: UserListQuery,
  ): Promise<Paginated<UserAccount>> {
    const { users } = await backendGraphql(usersDocument, {
      token,
      variables: {
        filter: {
          search: query.search || undefined,
          userId: query.userId,
          email: query.email,
          phone: query.phone,
          group: query.group,
          kind: query.kind,
          unitId: query.unitId,
          active: query.active,
        },
        page: { page: query.page, limit: query.limit ?? PAGE_SIZE },
      },
    });
    return users;
  },

  /** The members of one tie, for the name, e-mail and phone filters. */
  async memberFilterOptions(
    token: string,
    kind: MemberKind,
  ): Promise<MemberFilterOption[]> {
    const { memberFilterOptions } = await backendGraphql(
      memberFilterOptionsDocument,
      { token, variables: { kind } },
    );
    return memberFilterOptions;
  },

  /** The members of one tie at a glance (the list page's cards). */
  async memberStats(token: string, kind: MemberKind): Promise<MemberStats> {
    const { memberStats } = await backendGraphql(memberStatsDocument, {
      token,
      variables: { kind },
    });
    return memberStats;
  },

  async getUser(token: string, id: string): Promise<UserAccount> {
    const { user } = await backendGraphql(userDocument, {
      token,
      variables: { id },
    });
    return user;
  },

  async createUser(token: string, input: UserInput): Promise<TemporaryAccess> {
    const { createUser } = await backendGraphql(createUserDocument, {
      token,
      variables: { input },
    });
    return createUser;
  },

  async updateUser(
    token: string,
    id: string,
    input: Partial<UserInput>,
  ): Promise<UserAccount> {
    const { updateUser } = await backendGraphql(updateUserDocument, {
      token,
      variables: { id, input },
    });
    return updateUser;
  },

  async setActive(
    token: string,
    id: string,
    active: boolean,
  ): Promise<UserAccount> {
    const { setUserActive } = await backendGraphql(setUserActiveDocument, {
      token,
      variables: { id, active },
    });
    return setUserActive;
  },

  async resetPassword(token: string, id: string): Promise<TemporaryAccess> {
    const { resetUserPassword } = await backendGraphql(
      resetUserPasswordDocument,
      { token, variables: { id } },
    );
    return resetUserPassword;
  },

  async unlock(token: string, id: string): Promise<UserAccount> {
    const { unlockUser } = await backendGraphql(unlockUserDocument, {
      token,
      variables: { id },
    });
    return unlockUser;
  },

  async revokeSessions(token: string, id: string): Promise<UserAccount> {
    const { revokeUserSessions } = await backendGraphql(
      revokeUserSessionsDocument,
      { token, variables: { id } },
    );
    return revokeUserSessions;
  },

  async getPermissions(token: string, id: string): Promise<PermissionMatrix> {
    const { userPermissions } = await backendGraphql(userPermissionsDocument, {
      token,
      variables: { id },
    });
    return userPermissions;
  },

  async setPermissions(
    token: string,
    id: string,
    permissions: Permission[] | null,
  ): Promise<PermissionMatrix> {
    const { setUserPermissions } = await backendGraphql(
      setUserPermissionsDocument,
      {
        token,
        variables: {
          input: {
            userId: id,
            useGroupDefaults: permissions === null,
            permissions: permissions ?? undefined,
          },
        },
      },
    );
    return setUserPermissions;
  },

  /** Creation and last change of one record (null: it doesn't exist). */
  async recordStamp(
    token: string,
    entity: string,
    entityId: string,
  ): Promise<RecordStamp | null> {
    const { recordStamp } = await backendGraphql(recordStampDocument, {
      token,
      variables: { entity, id: entityId },
    });
    return recordStamp ?? null;
  },
};
