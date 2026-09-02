import z from "zod";

import { TCapyConnection } from "@app/services/app-connection/capy";

import { CapySyncListItemSchema, CapySyncSchema, CreateCapySyncSchema } from "./capy-sync-schemas";

export type TCapySync = z.infer<typeof CapySyncSchema>;

export type TCapySyncInput = z.infer<typeof CreateCapySyncSchema>;

export type TCapySyncListItem = z.infer<typeof CapySyncListItemSchema>;

export type TCapySyncWithCredentials = TCapySync & {
  connection: TCapyConnection;
};

export type TCapyEnvironmentVariable = {
  name: string;
  description: string | null;
  updatedAt: string;
};

export type TCapyEnvironmentVariableList = {
  items: TCapyEnvironmentVariable[];
};
