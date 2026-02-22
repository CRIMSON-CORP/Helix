import useWorkspaceMembers from "@/hooks/useWorkspaceMembers";
import { Avatar } from "../common/Avatar";
import useWorkspaceActivities from "@/hooks/useWorkspaceActivities";

interface ActivityFeedProps {
  workspace_id: number;
}

export function ActivityFeed({ workspace_id }: ActivityFeedProps) {
  const { members } = useWorkspaceMembers(workspace_id);
  const { activities } = useWorkspaceActivities(workspace_id);
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
      <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((activity) => {
          const user = members.find((u) => u.id === activity.user_id);
          if (!user) return null;

          return (
            <div key={activity.id} className="flex gap-4 items-start">
              <Avatar fallback={user.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90">
                  <span className="font-medium text-white">{user.name}</span>{" "}
                  <span className="text-white/60">{activity.action}</span>
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
