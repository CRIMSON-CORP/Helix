import { apiFetch } from "@/lib/fetch";
import type { Task } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuthentication } from "../store/useAuthentication";
import { useEffect } from "react";

function useTasks(workspace_id?: number, project_id?: number) {
  const { isAuthenticated } = useAuthentication((state) => state);
  const enabled = isAuthenticated && workspace_id !== undefined && project_id !== undefined;
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["workspace", workspace_id, "projects", project_id, "tasks"],
    queryFn: async () => {
      const res = await apiFetch(`/api/tasks/${workspace_id}/${project_id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await res.json();
      return data.tasks;
    },
    staleTime: Infinity,
    enabled,
  });

  useEffect(() => {
    if (!workspace_id) {
      console.warn("Workspace ID is missing, tasks will not be fetched");
    }
    if (!project_id) {
      console.warn("Project ID is missing, tasks will not be fetched");
    }
  }, [workspace_id, project_id]);

  return { tasks };
}

export default useTasks;
