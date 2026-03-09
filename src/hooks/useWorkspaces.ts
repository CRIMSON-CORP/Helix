import { apiFetch } from "@/lib/fetch";
import type { Workspace } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuthentication } from "../store/useAuthentication";
import { useSelectedWorkspace } from "@/store/useSelectedWorkspace";
import { useEffect, useRef } from "react";

function useWorkspaces() {
  const hasSetInitialWorkspace = useRef(false);
  const currentUser = useAuthentication((state) => state.currentUser);
  const setSelectedWorkspace = useSelectedWorkspace((state) => state.setSelectedWorkspace);
  const { isAuthenticated } = useAuthentication((state) => state);
  const { data: workspaces = [], isLoading: isWorskpaceLoading } = useQuery<Workspace[]>({
    queryKey: ["workspace", currentUser?.id],
    queryFn: async () => {
      const res = await apiFetch("/api/workspace");
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await res.json();
      return data.workspaces;
    },
    staleTime: Infinity,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (workspaces[0]?.id && !hasSetInitialWorkspace.current) {
      setSelectedWorkspace(workspaces[0]?.id);
      hasSetInitialWorkspace.current = true;
    }
  }, [workspaces, setSelectedWorkspace]);

  return { workspaces, isWorskpaceLoading };
}

export default useWorkspaces;
