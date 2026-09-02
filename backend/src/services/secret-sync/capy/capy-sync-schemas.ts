import { z } from "zod";

import { SecretSyncs } from "@app/lib/api-docs";
import { AppConnection } from "@app/services/app-connection/app-connection-enums";
import { SecretSync } from "@app/services/secret-sync/secret-sync-enums";
import {
  BaseSecretSyncSchema,
  GenericCreateSecretSyncFieldsSchema,
  GenericUpdateSecretSyncFieldsSchema
} from "@app/services/secret-sync/secret-sync-schemas";
import { TSyncOptionsConfig } from "@app/services/secret-sync/secret-sync-types";

import { SECRET_SYNC_NAME_MAP } from "../secret-sync-maps";

const CapySyncDestinationConfigSchema = z.object({
  projectId: z
    .string()
    .trim()
    .min(1, "Project ID is required")
    .startsWith("proj_", "Project ID must start with 'proj_'")
    .describe(SecretSyncs.DESTINATION_CONFIG.CAPY.projectId),
  projectName: z.string().trim().optional().describe(SecretSyncs.DESTINATION_CONFIG.CAPY.projectName)
});

const CapySyncOptionsConfig: TSyncOptionsConfig = { canImportSecrets: false };

export const CapySyncSchema = BaseSecretSyncSchema(SecretSync.Capy, CapySyncOptionsConfig)
  .extend({
    destination: z.literal(SecretSync.Capy),
    destinationConfig: CapySyncDestinationConfigSchema
  })
  .describe(JSON.stringify({ title: SECRET_SYNC_NAME_MAP[SecretSync.Capy] }));

export const CreateCapySyncSchema = GenericCreateSecretSyncFieldsSchema(SecretSync.Capy, CapySyncOptionsConfig).extend({
  destinationConfig: CapySyncDestinationConfigSchema
});

export const UpdateCapySyncSchema = GenericUpdateSecretSyncFieldsSchema(SecretSync.Capy, CapySyncOptionsConfig).extend({
  destinationConfig: CapySyncDestinationConfigSchema.optional()
});

export const CapySyncListItemSchema = z
  .object({
    name: z.literal("Capy"),
    connection: z.literal(AppConnection.Capy),
    destination: z.literal(SecretSync.Capy),
    canImportSecrets: z.literal(false),
    canRemoveSecretsOnDeletion: z.literal(true)
  })
  .describe(JSON.stringify({ title: SECRET_SYNC_NAME_MAP[SecretSync.Capy] }));
