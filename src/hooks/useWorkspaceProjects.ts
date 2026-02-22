import { apiFetch } from "@/lib/fetch";
import type { Project } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuthentication } from "../store/useAuthentication";

function useWorkspaceProjects(workspace_id?: number) {
  const { isAuthenticated } = useAuthentication((state) => state);
  const { data: workspaceProjects = [], isLoading: isWorkspaceProjectLoading } = useQuery<
    Project[]
  >({
    queryKey: ["projects", workspace_id],
    queryFn: async () => {
      const res = await apiFetch(`/api/projects/workspace/${workspace_id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await res.json();
      return data.projects;
    },
    staleTime: Infinity,
    enabled: isAuthenticated && workspace_id !== undefined,
  });

  return { workspaceProjects, isWorkspaceProjectLoading };
}

export default useWorkspaceProjects;
