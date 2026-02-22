import { apiFetch } from "@/lib/fetch";
import type { User } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuthentication } from "../store/useAuthentication";

function useUsers() {
  const { isAuthenticated } = useAuthentication((state) => state);
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiFetch("/api/users");
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await res.json();
      return data.users;
    },
    staleTime: Infinity,
    enabled: isAuthenticated,
  });

  return { users };
}

export default useUsers;
