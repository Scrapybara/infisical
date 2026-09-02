import z from "zod";

import { DiscriminativePick } from "@app/lib/types";

import { AppConnection } from "../app-connection-enums";
import {
  CapyConnectionSchema,
  CreateCapyConnectionSchema,
  ValidateCapyConnectionCredentialsSchema
} from "./capy-connection-schemas";

export type TCapyConnection = z.infer<typeof CapyConnectionSchema>;

export type TCapyConnectionInput = z.infer<typeof CreateCapyConnectionSchema> & {
  app: AppConnection.Capy;
};

export type TValidateCapyConnectionCredentialsSchema = typeof ValidateCapyConnectionCredentialsSchema;

export type TCapyConnectionConfig = DiscriminativePick<TCapyConnectionInput, "method" | "app" | "credentials"> & {
  orgId: string;
};

export type TCapyProject = {
  id: string;
  name: string;
  code: string;
};
