import { AxiosError } from "axios";

import { request } from "@app/lib/config/request";
import { BadRequestError } from "@app/lib/errors";
import { removeTrailingSlash } from "@app/lib/fn";
import { blockLocalAndPrivateIpAddresses } from "@app/lib/validator";
import { AppConnection } from "@app/services/app-connection/app-connection-enums";
import { IntegrationUrls } from "@app/services/integration-auth/integration-list";

import { CapyConnectionMethod } from "./capy-connection-enums";
import { TCapyConnection, TCapyConnectionConfig, TCapyProject } from "./capy-connection-types";

type TCapyApiProject = {
  id: string;
  name: string;
  code: string;
};

type TCapyApiProjectList = {
  items: TCapyApiProject[];
};

export const getCapyInstanceUrl = async (config: Pick<TCapyConnectionConfig | TCapyConnection, "credentials">) => {
  const instanceUrl = config.credentials.instanceUrl
    ? removeTrailingSlash(config.credentials.instanceUrl)
    : IntegrationUrls.CAPY_API_URL;

  await blockLocalAndPrivateIpAddresses(instanceUrl);

  return instanceUrl;
};

export const getCapyAuthHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
  Accept: "application/json",
  "Content-Type": "application/json"
});

export const getCapyConnectionListItem = () => {
  return {
    name: "Capy" as const,
    app: AppConnection.Capy as const,
    methods: Object.values(CapyConnectionMethod) as [CapyConnectionMethod.ApiKey]
  };
};

export const listCapyProjects = async (
  config: Pick<TCapyConnectionConfig | TCapyConnection, "credentials">
): Promise<TCapyProject[]> => {
  const instanceUrl = await getCapyInstanceUrl(config);

  const { data } = await request.get<TCapyApiProjectList>(`${instanceUrl}/api/v1/projects`, {
    headers: getCapyAuthHeaders(config.credentials.apiKey)
  });

  return data.items.map((project) => ({ id: project.id, name: project.name, code: project.code }));
};

export const validateCapyConnectionCredentials = async (config: TCapyConnectionConfig) => {
  try {
    await listCapyProjects(config);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new BadRequestError({
        message: `Failed to validate credentials: ${error.message || "Unknown error"}`
      });
    }
    throw new BadRequestError({
      message: "Unable to validate connection: verify credentials"
    });
  }

  return config.credentials;
};
