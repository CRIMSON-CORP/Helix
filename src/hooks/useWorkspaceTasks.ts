import { apiFetch } from "@/lib/fetch";
import type { Task } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuthentication } from "../store/useAuthentication";

function useWorkspaceTasks(workspace_id: number) {
  const { isAuthenticated } = useAuthentication((state) => state);
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks", workspace_id],
    queryFn: async () => {
      const res = await apiFetch(`/api/tasks/${workspace_id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await res.json();
      return data.tasks;
    },
    staleTime: Infinity,
    enabled: isAuthenticated,
  });

  return { tasks };
}

export default useWorkspaceTasks;
