import { CapySyncSchema, CreateCapySyncSchema, UpdateCapySyncSchema } from "@app/services/secret-sync/capy";
import { SecretSync } from "@app/services/secret-sync/secret-sync-enums";

import { registerSyncSecretsEndpoints } from "./secret-sync-endpoints";

export const registerCapySyncRouter = async (server: FastifyZodProvider) =>
  registerSyncSecretsEndpoints({
    destination: SecretSync.Capy,
    server,
    responseSchema: CapySyncSchema,
    createSchema: CreateCapySyncSchema,
    updateSchema: UpdateCapySyncSchema
  });
