import z from "zod";

import { AppConnections } from "@app/lib/api-docs";
import { AppConnection } from "@app/services/app-connection/app-connection-enums";
import {
  BaseAppConnectionSchema,
  GenericCreateAppConnectionFieldsSchema,
  GenericUpdateAppConnectionFieldsSchema
} from "@app/services/app-connection/app-connection-schemas";

import { APP_CONNECTION_NAME_MAP } from "../app-connection-maps";
import { CapyConnectionMethod } from "./capy-connection-enums";

export const CapyConnectionApiKeyCredentialsSchema = z.object({
  apiKey: z
    .string()
    .trim()
    .min(1, "API Key required")
    .max(255)
    .startsWith("capy_", "API Key must start with 'capy_'")
    .describe(AppConnections.CREDENTIALS.CAPY.apiKey),
  instanceUrl: z
    .string()
    .trim()
    .url("Invalid instance URL")
    .max(255)
    .optional()
    .describe(AppConnections.CREDENTIALS.CAPY.instanceUrl)
});

const BaseCapyConnectionSchema = BaseAppConnectionSchema.extend({ app: z.literal(AppConnection.Capy) });

export const CapyConnectionSchema = BaseCapyConnectionSchema.extend({
  method: z.literal(CapyConnectionMethod.ApiKey),
  credentials: CapyConnectionApiKeyCredentialsSchema
});

export const SanitizedCapyConnectionSchema = z.discriminatedUnion("method", [
  BaseCapyConnectionSchema.extend({
    method: z.literal(CapyConnectionMethod.ApiKey),
    // instanceUrl is not a secret, so it is safe to expose in the sanitized response
    credentials: CapyConnectionApiKeyCredentialsSchema.pick({ instanceUrl: true })
  }).describe(JSON.stringify({ title: `${APP_CONNECTION_NAME_MAP[AppConnection.Capy]} (API Key)` }))
]);

export const ValidateCapyConnectionCredentialsSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal(CapyConnectionMethod.ApiKey).describe(AppConnections.CREATE(AppConnection.Capy).method),
    credentials: CapyConnectionApiKeyCredentialsSchema.describe(AppConnections.CREATE(AppConnection.Capy).credentials)
  })
]);

export const CreateCapyConnectionSchema = ValidateCapyConnectionCredentialsSchema.and(
  GenericCreateAppConnectionFieldsSchema(AppConnection.Capy)
);

export const UpdateCapyConnectionSchema = z
  .object({
    credentials: CapyConnectionApiKeyCredentialsSchema.optional().describe(
      AppConnections.UPDATE(AppConnection.Capy).credentials
    )
  })
  .and(GenericUpdateAppConnectionFieldsSchema(AppConnection.Capy));

export const CapyConnectionListItemSchema = z
  .object({
    name: z.literal("Capy"),
    app: z.literal(AppConnection.Capy),
    methods: z.nativeEnum(CapyConnectionMethod).array()
  })
  .describe(JSON.stringify({ title: APP_CONNECTION_NAME_MAP[AppConnection.Capy] }));
