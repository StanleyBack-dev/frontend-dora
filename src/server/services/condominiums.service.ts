import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import { switchCondominiumDocument } from "@/server/graphql/operations/auth.operations";
import {
  condominiumDocument,
  condominiumsDocument,
  createCondominiumDocument,
  createUnitsDocument,
  deleteUnitDocument,
  setCondominiumModuleDocument,
  setCondominiumStatusDocument,
  unitPageDocument,
  unitsDocument,
  updateCondominiumDocument,
  updateUnitDocument,
} from "@/server/graphql/operations/condominiums.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  AppModule,
  Condominium,
  CondominiumInput,
  CondominiumStatus,
  CreateUnitsInput,
  Unit,
  UnitFilter,
  UnitWithResidents,
  UpdateUnitInput,
} from "@/shared/contracts/condominiums";

export const condominiumsService = {
  // === the session ===

  /** null: leaves every condominium (platform view). */
  async switchTo(token: string, condominiumId: string | null): Promise<void> {
    await backendGraphql(switchCondominiumDocument, {
      token,
      variables: { condominiumId },
    });
  },

  // === platform console ===

  async list(
    token: string,
    filter: { search?: string; status?: CondominiumStatus } = {},
  ): Promise<Condominium[]> {
    const { condominiums } = await backendGraphql(condominiumsDocument, {
      token,
      variables: {
        filter: { search: filter.search || undefined, status: filter.status },
      },
    });
    return condominiums;
  },

  async get(token: string, id: string): Promise<Condominium> {
    const { condominium } = await backendGraphql(condominiumDocument, {
      token,
      variables: { id },
    });
    return condominium;
  },

  async create(token: string, input: CondominiumInput): Promise<Condominium> {
    const { createCondominium } = await backendGraphql(
      createCondominiumDocument,
      { token, variables: { input } },
    );
    return createCondominium;
  },

  async update(
    token: string,
    id: string,
    input: CondominiumInput,
  ): Promise<Condominium> {
    const { updateCondominium } = await backendGraphql(
      updateCondominiumDocument,
      { token, variables: { id, input } },
    );
    return updateCondominium;
  },

  async setStatus(
    token: string,
    id: string,
    status: CondominiumStatus,
  ): Promise<Condominium> {
    const { setCondominiumStatus } = await backendGraphql(
      setCondominiumStatusDocument,
      { token, variables: { id, status } },
    );
    return setCondominiumStatus;
  },

  /** Turns an optional module on or off (platform administrator). */
  async setModule(
    token: string,
    id: string,
    module: AppModule,
    enabled: boolean,
  ): Promise<Condominium> {
    const { setCondominiumModule } = await backendGraphql(
      setCondominiumModuleDocument,
      { token, variables: { id, module, enabled } },
    );
    return setCondominiumModule;
  },

  // === units of the session's condominium ===

  /** Gestão > Unidades: a page of the filtered units with their people. */
  async unitPage(
    token: string,
    filter: UnitFilter,
    page: { page: number; limit: number },
  ): Promise<Paginated<UnitWithResidents>> {
    const { unitPage } = await backendGraphql(unitPageDocument, {
      token,
      variables: { filter, page },
    });
    return unitPage;
  },

  async units(token: string): Promise<Unit[]> {
    const { units } = await backendGraphql(unitsDocument, { token });
    return units;
  },

  async createUnits(token: string, input: CreateUnitsInput): Promise<Unit[]> {
    const { createUnits } = await backendGraphql(createUnitsDocument, {
      token,
      variables: { input },
    });
    return createUnits;
  },

  async updateUnit(
    token: string,
    id: string,
    input: UpdateUnitInput,
  ): Promise<Unit> {
    const { updateUnit } = await backendGraphql(updateUnitDocument, {
      token,
      variables: { id, input },
    });
    return updateUnit;
  },

  async deleteUnit(token: string, id: string): Promise<void> {
    await backendGraphql(deleteUnitDocument, { token, variables: { id } });
  },
};
