import { logger } from "@app/lib/logger";
import { OrgServiceActor } from "@app/lib/types";

import { AppConnection } from "../app-connection-enums";
import { listCapyProjects } from "./capy-connection-fns";
import { TCapyConnection } from "./capy-connection-types";

type TGetAppConnectionFunc = (
  app: AppConnection,
  connectionId: string,
  actor: OrgServiceActor
) => Promise<TCapyConnection>;

export const capyConnectionService = (getAppConnection: TGetAppConnectionFunc) => {
  const listProjects = async (connectionId: string, actor: OrgServiceActor) => {
    const appConnection = await getAppConnection(AppConnection.Capy, connectionId, actor);

    try {
      const projects = await listCapyProjects(appConnection);
      return projects;
    } catch (error) {
      logger.error(error, "Failed to establish connection with Capy");
      return [];
    }
  };

  return {
    listProjects
  };
};
