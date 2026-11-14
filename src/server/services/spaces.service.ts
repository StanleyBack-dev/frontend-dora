import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  addSpacePhotoDocument,
  createSpaceDocument,
  deleteSpaceDocument,
  removeSpacePhotoDocument,
  setSpaceActiveDocument,
  spaceDocument,
  spacesDocument,
  updateSpaceDocument,
} from "@/server/graphql/operations/spaces.operations";
import type { Space, SpaceInput } from "@/shared/contracts/spaces";

export const spacesService = {
  /** Inactive ones only for whoever manages spaces (the API checks it). */
  async list(token: string, includeInactive = false): Promise<Space[]> {
    const { spaces } = await backendGraphql(spacesDocument, {
      token,
      variables: { includeInactive },
    });
    return spaces;
  },

  async get(token: string, id: string): Promise<Space> {
    const { space } = await backendGraphql(spaceDocument, {
      token,
      variables: { id },
    });
    return space;
  },

  async create(token: string, input: SpaceInput): Promise<Space> {
    const { createSpace } = await backendGraphql(createSpaceDocument, {
      token,
      variables: { input },
    });
    return createSpace;
  },

  async update(token: string, id: string, input: SpaceInput): Promise<Space> {
    const { updateSpace } = await backendGraphql(updateSpaceDocument, {
      token,
      variables: { id, input },
    });
    return updateSpace;
  },

  async setActive(token: string, id: string, active: boolean): Promise<Space> {
    const { setSpaceActive } = await backendGraphql(setSpaceActiveDocument, {
      token,
      variables: { id, active },
    });
    return setSpaceActive;
  },

  /** `photo`: base64 the browser already shrank (the API checks it). */
  async addPhoto(
    token: string,
    spaceId: string,
    photo: string,
  ): Promise<Space> {
    const { addSpacePhoto } = await backendGraphql(addSpacePhotoDocument, {
      token,
      variables: { spaceId, photo },
    });
    return addSpacePhoto;
  },

  async removePhoto(
    token: string,
    spaceId: string,
    photoId: string,
  ): Promise<Space> {
    const { removeSpacePhoto } = await backendGraphql(
      removeSpacePhotoDocument,
      { token, variables: { spaceId, photoId } },
    );
    return removeSpacePhoto;
  },

  async remove(token: string, id: string): Promise<void> {
    await backendGraphql(deleteSpaceDocument, { token, variables: { id } });
  },
};
