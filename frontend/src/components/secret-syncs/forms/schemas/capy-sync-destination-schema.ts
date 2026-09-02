import { z } from "zod";

import { BaseSecretSyncSchema } from "@app/components/secret-syncs/forms/schemas/base-secret-sync-schema";
import { SecretSync } from "@app/hooks/api/secretSyncs";

export const CapySyncDestinationSchema = BaseSecretSyncSchema().merge(
  z.object({
    destination: z.literal(SecretSync.Capy),
    destinationConfig: z.object({
      projectId: z.string().trim().min(1, "Project required"),
      projectName: z.string().trim().optional()
    })
  })
);
