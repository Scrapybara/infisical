/* eslint-disable no-await-in-loop */
import { request } from "@app/lib/config/request";
import { getCapyAuthHeaders, getCapyInstanceUrl } from "@app/services/app-connection/capy";
import { SecretSyncError } from "@app/services/secret-sync/secret-sync-errors";
import { matchesSchema } from "@app/services/secret-sync/secret-sync-fns";
import { SECRET_SYNC_NAME_MAP } from "@app/services/secret-sync/secret-sync-maps";
import { TSecretMap } from "@app/services/secret-sync/secret-sync-types";

import { TCapyEnvironmentVariableList, TCapySyncWithCredentials } from "./capy-sync-types";

// The Capy public API caps one batch write at 500 entries; a folder past
// that syncs as several requests.
const CAPY_BATCH_SIZE = 500;

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
};

const buildEnvironmentVariablesUrl = (instanceUrl: string, projectId: string) =>
  `${instanceUrl}/api/v1/projects/${encodeURIComponent(projectId)}/environment-variables`;

const listCapyEnvironmentVariables = async (secretSync: TCapySyncWithCredentials) => {
  const instanceUrl = await getCapyInstanceUrl(secretSync.connection);
  const { data } = await request.get<TCapyEnvironmentVariableList>(
    buildEnvironmentVariablesUrl(instanceUrl, secretSync.destinationConfig.projectId),
    { headers: getCapyAuthHeaders(secretSync.connection.credentials.apiKey) }
  );
  return data.items;
};

const putCapyEnvironmentVariables = async (
  secretSync: TCapySyncWithCredentials,
  entries: { name: string; value: string; description?: string }[]
) => {
  const instanceUrl = await getCapyInstanceUrl(secretSync.connection);
  for (const batch of chunk(entries, CAPY_BATCH_SIZE)) {
    try {
      await request.put(
        buildEnvironmentVariablesUrl(instanceUrl, secretSync.destinationConfig.projectId),
        { entries: batch },
        { headers: getCapyAuthHeaders(secretSync.connection.credentials.apiKey) }
      );
    } catch (error) {
      throw new SecretSyncError({ error, secretKey: batch.length === 1 ? batch[0].name : undefined });
    }
  }
};

const deleteCapyEnvironmentVariables = async (secretSync: TCapySyncWithCredentials, names: string[]) => {
  if (names.length === 0) return;
  const instanceUrl = await getCapyInstanceUrl(secretSync.connection);
  for (const batch of chunk(names, CAPY_BATCH_SIZE)) {
    try {
      await request.delete(buildEnvironmentVariablesUrl(instanceUrl, secretSync.destinationConfig.projectId), {
        data: { names: batch },
        headers: getCapyAuthHeaders(secretSync.connection.credentials.apiKey)
      });
    } catch (error) {
      throw new SecretSyncError({ error, secretKey: batch.length === 1 ? batch[0] : undefined });
    }
  }
};

const buildSyncDescription = (secretSync: TCapySyncWithCredentials) => {
  const envSlug = secretSync.environment?.slug;
  return envSlug ? `Synced from Infisical (${envSlug})` : "Synced from Infisical";
};

export const CapySyncFns = {
  syncSecrets: async (secretSync: TCapySyncWithCredentials, secretMap: TSecretMap) => {
    const { environment, syncOptions } = secretSync;
    const description = buildSyncDescription(secretSync);

    await putCapyEnvironmentVariables(
      secretSync,
      Object.entries(secretMap).map(([name, { value }]) => ({ name, value, description }))
    );

    if (syncOptions.disableSecretDeletion) return;

    const existing = await listCapyEnvironmentVariables(secretSync);
    const stale = existing
      .map((variable) => variable.name)
      .filter((name) => matchesSchema(name, environment?.slug || "", syncOptions.keySchema) && !(name in secretMap));

    await deleteCapyEnvironmentVariables(secretSync, stale);
  },
  removeSecrets: async (secretSync: TCapySyncWithCredentials, secretMap: TSecretMap) => {
    const existing = await listCapyEnvironmentVariables(secretSync);
    await deleteCapyEnvironmentVariables(
      secretSync,
      existing.map((variable) => variable.name).filter((name) => name in secretMap)
    );
  },
  getSecrets: async (secretSync: TCapySyncWithCredentials): Promise<TSecretMap> => {
    throw new Error(`${SECRET_SYNC_NAME_MAP[secretSync.destination]} does not support importing secrets.`);
  }
};
