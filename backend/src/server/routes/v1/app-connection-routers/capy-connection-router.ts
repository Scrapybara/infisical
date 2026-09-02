import z from "zod";

import { readLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AppConnection } from "@app/services/app-connection/app-connection-enums";
import {
  CreateCapyConnectionSchema,
  SanitizedCapyConnectionSchema,
  UpdateCapyConnectionSchema
} from "@app/services/app-connection/capy";
import { AuthMode } from "@app/services/auth/auth-type";

import { registerAppConnectionEndpoints } from "./app-connection-endpoints";

export const registerCapyConnectionRouter = async (server: FastifyZodProvider) => {
  registerAppConnectionEndpoints({
    app: AppConnection.Capy,
    server,
    sanitizedResponseSchema: SanitizedCapyConnectionSchema,
    createSchema: CreateCapyConnectionSchema,
    updateSchema: UpdateCapyConnectionSchema
  });

  // The following endpoints are for internal Infisical App use only and not part of the public API
  server.route({
    method: "GET",
    url: `/:connectionId/projects`,
    config: {
      rateLimit: readLimit
    },
    schema: {
      operationId: "listCapyProjects",
      params: z.object({
        connectionId: z.string().uuid()
      }),
      response: {
        200: z
          .object({
            id: z.string(),
            name: z.string(),
            code: z.string()
          })
          .array()
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.OAUTH]),
    handler: async (req) => {
      const { connectionId } = req.params;
      const projects = await server.services.appConnection.capy.listProjects(connectionId, req.permission);
      return projects;
    }
  });
};
