import { apiFetch } from "@/lib/fetch";
import type { Project } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuthentication } from "../store/useAuthentication";

function useProject(project_id?: number) {
  const { isAuthenticated } = useAuthentication((state) => state);
  const enabled = isAuthenticated && project_id != undefined;
  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ["project", project_id],
    queryFn: async () => {
      const res = await apiFetch(`/api/projects/${project_id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch project");
      }
      const data = await res.json();
      return data.project;
    },
    staleTime: Infinity,
    enabled,
  });

  return { project, isProjectLoading };
}

export default useProject;
