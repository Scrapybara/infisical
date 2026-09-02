import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { appConnectionKeys } from "../queries";
import { TCapyProject } from "./types";

const capyConnectionKeys = {
  all: [...appConnectionKeys.all, "capy"] as const,
  listProjects: (connectionId: string) =>
    [...capyConnectionKeys.all, "projects", connectionId] as const
};

export const useCapyConnectionListProjects = (
  connectionId: string,
  options?: Omit<
    UseQueryOptions<
      TCapyProject[],
      unknown,
      TCapyProject[],
      ReturnType<typeof capyConnectionKeys.listProjects>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: capyConnectionKeys.listProjects(connectionId),
    queryFn: async () => {
      const { data } = await apiRequest.get<TCapyProject[]>(
        `/api/v1/app-connections/capy/${connectionId}/projects`
      );

      return data;
    },
    ...options
  });
};
