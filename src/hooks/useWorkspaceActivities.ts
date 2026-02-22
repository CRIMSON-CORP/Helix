import { apiFetch } from "@/lib/fetch";
import type { Activity } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuthentication } from "../store/useAuthentication";

function useWorkspaceActivities(workspace_id: number) {
  const { isAuthenticated } = useAuthentication((state) => state);
  const { data: activities = [], isLoading: isActivityLoading } = useQuery<Activity[]>({
    queryKey: ["workspace", workspace_id, "activities"],
    queryFn: async () => {
      const res = await apiFetch(`/api/activities/${workspace_id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await res.json();
      return data.activities;
    },
    staleTime: Infinity,
    enabled: isAuthenticated,
  });

  return { activities, isActivityLoading };
}

export default useWorkspaceActivities;
