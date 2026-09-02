import { AppConnection } from "@app/hooks/api/appConnections/enums";
import { SecretSync } from "@app/hooks/api/secretSyncs";
import { TRootSecretSync } from "@app/hooks/api/secretSyncs/types/root-sync";

export type TCapySync = TRootSecretSync & {
  destination: SecretSync.Capy;
  destinationConfig: { projectId: string; projectName?: string };
  connection: {
    app: AppConnection.Capy;
    name: string;
    id: string;
  };
};
