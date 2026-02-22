import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragEndEvent,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { TaskCard } from "./TaskCard";
import { Search, Filter, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "../common/Button";
import { TaskModal } from "./TaskModal";
import type { Task } from "@/server/db/schema";
import useProject from "@/hooks/useProject";
import useTasks from "@/hooks/useTasks";
import { useSelectedWorkspace } from "@/store/useSelectedWorkspace";
import { useSelectedProject } from "@/store/useSelectedProject";
import { AlertModal } from "../ui/AlertModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetch";
import toast from "react-hot-toast";
import { columnsTitle } from "@/lib/utils";
import { statusEnum } from "./../../server/db/schema";

const COLUMNS = statusEnum.enumValues;

export function ProjectBoard() {
  const selectedProject = useSelectedProject((state) => state.selectedProject);
  const { project } = useProject(selectedProject);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const { tasks } = useTasks(selectedWorkspace, selectedProject);
  const queryClient = useQueryClient();
  const previousTaskStatus = useRef<Task["status"] | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiFetch(
        `/api/tasks/${selectedWorkspace}/${selectedProject}/${taskId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return taskId;
    },
    onSuccess(taskId) {
      queryClient.setQueryData(
        ["workspace", selectedWorkspace, "projects", selectedProject, "tasks"],
        (oldTasks: Task[] = []) => oldTasks.filter((t) => t.id !== taskId),
      );
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
      toast.success("Task deleted successfully");
      setTaskToDelete(null);
    },
    onError(error) {
      toast.error(error.message);
      setTaskToDelete(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: Task["status"] }) => {
      const response = await apiFetch(
        `/api/tasks/${selectedWorkspace}/${selectedProject}/${taskId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.task;
    },
    onSuccess(task) {
      queryClient.setQueryData(
        ["workspace", selectedWorkspace, "projects", selectedProject, "tasks"],
        (oldTasks: Task[] = []) =>
          oldTasks.map((t) => {
            if (t.id === task.id) {
              return { ...t, status: task.status };
            }
            return t;
          }),
      );
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    onError(error) {
      toast.error(error.message);
      queryClient.setQueryData(
        ["workspace", selectedWorkspace, "projects", selectedProject, "tasks"],
        (oldTasks: Task[] = []) =>
          oldTasks.map((t) => {
            if (t.id === activeId) {
              return { ...t, status: previousTaskStatus.current };
            }
            return t;
          }),
      );
    },
  });

  const handleAddTask = (status: Task["status"]) => {
    setEditingTask({ status });
    setIsTaskModalOpen(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const activeTask = useMemo(() => tasks.find((t) => t.id === activeId), [activeId, tasks]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(parseInt(event.active.id.toString()));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = active.id;
    const overId = over.id;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    previousTaskStatus.current = task.status;

    const newStatus = (
      COLUMNS.includes(overId as Task["status"])
        ? overId
        : tasks.find((t) => t.id === overId)?.status
    ) as Task["status"];
    if (!newStatus) return;
    // Dropped on a column container
    updateStatusMutation.mutate({
      taskId: parseInt(taskId.toString()),
      status: newStatus,
    });

    queryClient.setQueryData(
      ["workspace", selectedWorkspace, "projects", selectedProject, "tasks"],
      (oldTasks: Task[] = []) =>
        oldTasks.map((t) => {
          if (t.id === taskId) {
            return { ...t, status: newStatus };
          }
          return t;
        }),
    );

    setActiveId(null);
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  if (!project) return;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{project?.name}</h1>
              <p className="text-white/60">{project?.description}</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="h-10 pl-9 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-64"
                />
              </div>
              <Button
                variant="outline"
                className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white border-0"
                onClick={() => {
                  setEditingTask(undefined);
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> New Task
              </Button>
            </div>
          </div>

          {/* Board */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-6 min-w-full h-full pb-4">
              {COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col);
                return (
                  <Column
                    key={col}
                    id={col}
                    title={columnsTitle[col]}
                    tasks={colTasks}
                    onEditTask={(task) => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    onDeleteTask={(taskId) => setTaskToDelete(taskId)}
                    onAddTask={handleAddTask}
                  />
                );
              })}
            </div>
          </div>
        </div>
        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? <TaskCard {...activeTask} isOverlay /> : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>

      {project && isTaskModalOpen && (
        <TaskModal onClose={() => setIsTaskModalOpen(false)} initialData={editingTask} />
      )}

      <AlertModal
        isOpen={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => taskToDelete && deleteMutation.mutate(taskToDelete)}
        isLoading={deleteMutation.isPending}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
      />
    </>
  );
}

interface ColumnProps {
  id: Task["status"];
  title: string;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  onAddTask: (status: Task["status"]) => void;
}

function Column({ id, title, tasks, onEditTask, onDeleteTask, onAddTask }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "Column",
      status: id,
    },
  });

  return (
    <div ref={setNodeRef} className="w-80 shrink-0 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-semibold text-white/80 text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white/20" />
          {title}
        </h3>
        <span className="text-xs font-medium text-white/30 bg-white/5 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      {/* Column Area */}
      <div className="flex-1 rounded-3xl bg-black/20 border border-white/5 p-3 flex flex-col gap-3 overflow-y-auto min-h-125">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <div key={task.id} className="relative group/card">
              <SortableTaskCard task={task} />
              <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity flex gap-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTask && onEditTask(task);
                  }}
                  className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white/70 hover:text-white transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask && onDeleteTask(task.id);
                  }}
                  className="p-1.5 rounded-lg bg-black/50 hover:bg-rose-500/80 text-white/70 hover:text-white transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </SortableContext>
        <Button
          variant="ghost"
          onClick={() => onAddTask(id)}
          className="w-full justify-start text-white/40 hover:text-white hover:bg-white/5 h-10 border border-dashed border-white/10"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>
    </div>
  );
}

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard {...task} />
    </div>
  );
}
