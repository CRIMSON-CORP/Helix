import useMyTasks from "@/hooks/useMyTasks";
import { TaskCard } from "../project/TaskCard";
import { useSelectedWorkspace } from "@/store/useSelectedWorkspace";

export function MyTasks() {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const { tasks } = useMyTasks(selectedWorkspace);
  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h1 className="text-3xl font-bold text-white mb-6">My Tasks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks && tasks?.length > 0 ? (
          tasks?.map((task) => <TaskCard key={task.id} {...task} />)
        ) : (
          <p className="text-white/40 col-span-full text-center py-20">
            No tasks assigned to you yet.
          </p>
        )}
      </div>
    </div>
  );
}
