import { Users, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityFeed } from "./ActivityFeed";
import useWorkspaceProjects from "@/hooks/useWorkspaceProjects";
import type { Workspace } from "@/server/db/schema";
import useWorkspaceTasks from "@/hooks/useWorkspaceTasks";
import useWorkspaceMembers from "@/hooks/useWorkspaceMembers";
import { useBoardView } from "@/store/useBoardView";
import { useSelectedProject } from "@/store/useSelectedProject";
import type { Status } from "@/server/db/schema";

interface DashboardProps {
  workspace: Workspace;
}

const avatarColors = ["bg-pink-500", "bg-cyan-500", "bg-purple-500", "bg-amber-500"];

export function Dashboard({ workspace }: DashboardProps) {
  const { tasks: totalTasks } = useWorkspaceTasks(workspace.id);
  const setView = useBoardView((state) => state.setView);
  const setSelectedProject = useSelectedProject((state) => state.setSelectedProject);
  const { members } = useWorkspaceMembers(workspace.id);
  const tasksCountMap: Record<Status, number> = { completed: 0, pending: 0, backlog: 0, review: 0 };

  totalTasks.forEach((t) => {
    tasksCountMap[t.status] += 1;
  });

  const progress =
    totalTasks.length === 0 ? 0 : Math.round((tasksCountMap.completed / totalTasks.length) * 100);

  const { workspaceProjects } = useWorkspaceProjects(workspace.id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hello, Team! 👋</h1>
        <p className="text-white/60">Here's what's happening in {workspace.name} today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={totalTasks.length}
          icon={<LayersIcon className="text-blue-400" />}
          trend="+12% from last week"
        />
        <StatCard
          title="Completed"
          value={tasksCountMap.completed}
          icon={<CheckCircle2 className="text-green-400" />}
          trend="+5 tasks today"
        />
        <StatCard
          title="In Progress"
          value={tasksCountMap.pending}
          icon={<Clock className="text-amber-400" />}
          trend="3 deadlines soon"
        />
        <StatCard
          title="Backlog"
          value={tasksCountMap.backlog}
          icon={<AlertCircle className="text-purple-400" />}
          trend="Needs attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Section */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-6">Overall Progress</h3>
          <div className="relative pt-4">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-200 bg-purple-500/20">
                  Project Completion
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-purple-200">
                  {progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-white/10">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
              ></div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {workspaceProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProject(p.id);
                  setView("project");
                }}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white">{p.name}</h4>
                  <span className="h-2 w-2 rounded-full bg-green-400 mt-1.5" />
                </div>
                <p className="text-sm text-white/40 mb-3">{p.description}</p>
                <div className="flex -space-x-2">
                  {members.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      title={user.name}
                      className="h-6 w-6 rounded-full bg-gray-600 border border-black ring-2 ring-background flex items-center justify-center text-[10px] text-white"
                    >
                      {user.name[0]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Activity / Workload placeholder */}
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" /> Team Workload
            </h3>
            <div className="space-y-4">
              {/* Mock workload bars */}
              {members.map((user) => {
                const totalTasksAssignedToUser = totalTasks.filter(
                  (t) => t.assigned_to === user.id,
                );

                const totalCompletedTasks = totalTasksAssignedToUser.filter(
                  (task) => task.status === "completed",
                );

                const progress =
                  totalTasksAssignedToUser.length === 0
                    ? "0%"
                    : (totalCompletedTasks.length / totalTasksAssignedToUser.length) * 100 + "%";

                return (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">
                      {user.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/80">{user.name}</span>
                        <span className="text-white/40">{totalTasksAssignedToUser.length}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          style={{
                            width: progress,
                          }}
                          className={cn(
                            "h-full rounded-full",
                            avatarColors[Math.floor(Math.random() * avatarColors.length)],
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ActivityFeed workspace_id={workspace.id} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-white/5 text-white">{icon}</div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400">
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-white/40">{title}</p>
      </div>
    </div>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      width={24}
      height={24}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-layers", className)}
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}
