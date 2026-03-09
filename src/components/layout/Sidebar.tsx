import { useEffect, useState } from "react";
import { Home, User, Plus, ChevronDown, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../common/Button";
import { Avatar } from "../common/Avatar";
import useWorkspaceProjects from "@/hooks/useWorkspaceProjects";
import useWorkspaces from "@/hooks/useWorkspaces";
import { useAuthentication } from "@/store/useAuthentication";
import { useSelectedProject } from "@/store/useSelectedProject";
import { useSelectedWorkspace } from "@/store/useSelectedWorkspace";
import { useBoardView } from "@/store/useBoardView";

interface SidebarProps {
  onOpenWorkspaceModal: () => void;
  onOpenProjectModal: () => void;
  onLogout: () => void;
}

export function Sidebar({ onOpenWorkspaceModal, onOpenProjectModal, onLogout }: SidebarProps) {
  const { workspaces } = useWorkspaces();
  const { currentUser } = useAuthentication((state) => state);
  const { selectedProject, setSelectedProject } = useSelectedProject((state) => state);
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const setSelectedWorkspace = useSelectedWorkspace((state) => state.setSelectedWorkspace);
  const { view, setView } = useBoardView();
  const currentWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspace);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });
      if (response.ok) {
        onLogout();
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    if (selectedWorkspace) {
      setSelectedProject(undefined);
    }
  }, [selectedWorkspace, setSelectedProject]);

  return (
    <aside className="w-72 border-r border-white/5 bg-background/50 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      {/* Workspace Switcher */}
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <div
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-xl transition-colors group",
              workspaces.length > 0 && "hover:bg-white/5 cursor-pointer",
            )}
            onClick={() => workspaces.length > 0 && setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">
                {currentWorkspace?.icon ?? "H"}
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm leading-tight text-white/90 group-hover:text-white">
                  {currentWorkspace?.name ?? "Helix"}
                </p>
                <p className="text-xs text-white/40 group-hover:text-white/60">
                  {workspaces.length > 0 ? "Free Plan" : "Get Started"}
                </p>
              </div>
            </div>
            {workspaces.length > 0 && (
              <ChevronDown className="h-4 w-4 text-white/40 group-hover:text-white/60" />
            )}
          </div>

          {/* Dropdown */}
          {isWorkspaceMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setSelectedWorkspace(ws.id);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors",
                      currentWorkspace?.id === ws.id
                        ? "bg-purple-500/10 text-purple-400"
                        : "hover:bg-white/5 text-white/60 hover:text-white",
                    )}
                  >
                    <span className="h-6 w-6 rounded bg-white/5 flex items-center justify-center text-xs">
                      {ws.icon}
                    </span>
                    {ws.name}
                  </button>
                ))}
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={() => {
                    onOpenWorkspaceModal();
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-white/40 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Main Nav */}
        <div>
          <p className="text-xs font-medium text-white/30 uppercase px-3 mb-2 tracking-wider">
            Menu
          </p>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                view === "dashboard"
                  ? "bg-white/5 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5",
              )}
              onClick={() => setView("dashboard")}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                view === "my-tasks"
                  ? "bg-white/5 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5",
              )}
              onClick={() => setView("my-tasks")}
            >
              <User className="h-4 w-4" />
              My Tasks
            </Button>
          </div>
        </div>

        {/* Projects */}
        {workspaces.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-xs font-medium text-white/30 uppercase tracking-wider">Projects</p>
              <button
                onClick={onOpenProjectModal}
                className="text-white/30 hover:text-white transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {currentWorkspace && <WorkspaceProjects />}
          </div>
        )}
      </div>

      {/* User Profile */}
      {currentUser && (
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <Avatar fallback={currentUser.name} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-white/40 truncate">{currentUser.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function WorkspaceProjects() {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const { workspaceProjects } = useWorkspaceProjects(selectedWorkspace);
  const selectedProject = useSelectedProject((state) => state.selectedProject);
  const setSelectedProject = useSelectedProject((state) => state.setSelectedProject);
  const { view, setView } = useBoardView();
  return (
    <div className="space-y-1">
      {workspaceProjects.map((project) => (
        <Button
          key={project.id}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            selectedProject === project.id
              ? "bg-white/5 text-white"
              : "text-white/60 hover:text-white hover:bg-white/5",
          )}
          onClick={() => {
            setSelectedProject(project.id);
            setView("project");
          }}
        >
          <span className="h-2 w-2 rounded-full bg-indigo-500/50" />
          {project.name}
        </Button>
      ))}
    </div>
  );
}
