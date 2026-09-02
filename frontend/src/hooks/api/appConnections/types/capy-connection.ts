import { AppConnection } from "@app/hooks/api/appConnections/enums";
import { TRootAppConnection } from "@app/hooks/api/appConnections/types/root-connection";

export enum CapyConnectionMethod {
  ApiKey = "api-key"
}

export type TCapyConnection = TRootAppConnection & { app: AppConnection.Capy } & {
  method: CapyConnectionMethod.ApiKey;
  credentials: {
    apiKey: string;
    instanceUrl?: string;
  };
};
