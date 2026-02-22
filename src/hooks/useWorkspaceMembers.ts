import { apiFetch } from "@/lib/fetch";
import type { User } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuthentication } from "../store/useAuthentication";

function useWorkspaceMembers(workspace_id: number) {
  const { isAuthenticated } = useAuthentication((state) => state);
  const { data: members = [], isLoading: isMembersLoading } = useQuery<User[]>({
    queryKey: ["workspace_members"],
    queryFn: async () => {
      const res = await apiFetch(`/api/workspace/${workspace_id}/members`);
      if (!res.ok) {
        throw new Error("Failed to fetch Members");
      }
      const data = await res.json();
      return data.members;
    },
    staleTime: Infinity,
    enabled: isAuthenticated && workspace_id !== undefined,
  });

  return { members, isMembersLoading };
}

export default useWorkspaceMembers;
