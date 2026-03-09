import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { MainLayout } from "./components/layout/MainLayout";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ProjectBoard } from "./components/project/ProjectBoard";
import { MyTasks } from "./components/dashboard/MyTasks";
import type { User } from "./server/db/schema";
import { CreateWorkspaceModal } from "./components/workspace/CreateWorkspaceModal";
import { CreateProjectModal } from "./components/project/CreateProjectModal";
import { LoginPage } from "./components/auth/LoginPage";
import { CreateWorkspaceView } from "./components/workspace/CreateWorkspaceView";
import "./index.css";
import "../styles/globals.css";
import { apiFetch } from "./lib/fetch";
import { useAuthentication } from "./store/useAuthentication";
import useWorkspaces from "./hooks/useWorkspaces";
import { Toaster } from "react-hot-toast";
import { useBoardView } from "./store/useBoardView";
import { useSelectedWorkspace } from "./store/useSelectedWorkspace";
import { useSelectedProject } from "./store/useSelectedProject";
const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <HelixApp />
    </QueryClientProvider>
  );
}

function HelixApp() {
  const { isAuthenticated, currentUser, setCurrentUser, setIsAuthenticated } = useAuthentication(
    (state) => state,
  );
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const selecetedProject = useSelectedProject((state) => state.selectedProject);
  const view = useBoardView((state) => state.view);

  const { workspaces, isWorskpaceLoading } = useWorkspaces();

  const { isLoading } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await apiFetch("/api/auth/me", {}, false);
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await res.json();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    },
    staleTime: Infinity,
    retry: false,
  });

  if (isLoading || isWorskpaceLoading) {
    return null;
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleSignup = (newUser: User) => {
    setCurrentUser(newUser);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  const currentWorkspace =
    workspaces.find((w) => w.id.toString() === selectedWorkspace?.toString()) ?? workspaces[0];

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <MainLayout
      sidebar={
        <Sidebar
          onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
          onOpenProjectModal={() => setIsProjectModalOpen(true)}
          onLogout={handleLogout}
        />
      }
    >
      {!currentWorkspace ? (
        <CreateWorkspaceView />
      ) : view === "project" && selecetedProject ? (
        <ProjectBoard />
      ) : view === "my-tasks" ? (
        <MyTasks />
      ) : (
        <Dashboard workspace={currentWorkspace} />
      )}
      <CreateWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </MainLayout>
  );
}
