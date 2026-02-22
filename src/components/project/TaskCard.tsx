import { Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";
import { Avatar } from "../common/Avatar";
import type { Task } from "@/server/db/schema";
import useWorkspaceMembers from "@/hooks/useWorkspaceMembers";

interface TaskCardProps extends Task {
  isOverlay?: boolean;
}

export function TaskCard({
  title,
  due_date,
  description,
  assigned_to,
  workspace_id,
  priority,
  isOverlay,
}: TaskCardProps) {
  const priorityColor = {
    low: "bg-emerald-500/10 text-emerald-400",
    medium: "bg-amber-500/10 text-amber-400",
    high: "bg-rose-500/10 text-rose-400",
  }[priority];

  const { members } = useWorkspaceMembers(workspace_id);

  const assignee = members.find((user) => user.id === assigned_to);

  return (
    <div
      className={cn(
        "group p-4 rounded-2xl bg-[#1e1e24] border border-white/5 hover:border-white/10 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing",
        isOverlay
          ? "shadow-xl border-purple-500/30 ring-2 ring-purple-500/20 rotate-2 cursor-grabbing"
          : "",
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
            priorityColor,
          )}
        >
          {priority}
        </span>
        <button className="text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <h4 className="text-sm font-medium text-white mb-1 leading-snug">{title}</h4>
      {description && (
        <p className="text-xs text-white/40 line-clamp-2 mb-3 leading-relaxed">{description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <Calendar className="h-3 w-3" />
          <span>
            {new Date(due_date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        {assignee ? (
          <Avatar fallback={assignee.name} className="h-6 w-6 ring-1 ring-[#1e1e24]" />
        ) : (
          <div className="h-6 w-6 rounded-full border border-dashed border-white/20 flex items-center justify-center text-xs text-white/20">
            ?
          </div>
        )}
      </div>
    </div>
  );
}
