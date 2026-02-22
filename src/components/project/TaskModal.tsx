import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../common/Button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  type Task,
  type Priority,
  type TaskInsert,
  statusEnum,
  priorityEnum,
} from "@/server/db/schema";
import toast from "react-hot-toast";
import { useSelectedWorkspace } from "@/store/useSelectedWorkspace";
import { useSelectedProject } from "@/store/useSelectedProject";
import useUsers from "@/hooks/useUsers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetch";
import { columnsTitle } from "@/lib/utils";

interface TaskModalProps {
  onClose: () => void;
  initialData?: Partial<Task>;
}

export function TaskModal({ onClose, initialData }: TaskModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState<Priority>(initialData?.priority || "low");
  const [status, setStatus] = useState<Task["status"]>(initialData?.status || "backlog");
  const [assigneeId, setAssigneeId] = useState(initialData?.assigned_to?.toString() || "");
  const [dueDate, setDueDate] = useState(initialData?.due_date || "");
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const selectedProject = useSelectedProject((state) => state.selectedProject);

  const { users } = useUsers();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (payload: TaskInsert) => {
      const response = await apiFetch(`/api/tasks/${selectedWorkspace}/${selectedProject}`, {
        body: JSON.stringify(payload),
        method: "POST",
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error);
      return data.task;
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess(task) {
      if (!selectedWorkspace || !selectedProject) return;
      queryClient.setQueryData(
        ["workspace", selectedWorkspace, "projects", selectedProject, "tasks"],
        (tasks: Task[]) => [...tasks, task],
      );
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: TaskInsert) => {
      const response = await apiFetch(
        `/api/tasks/${selectedWorkspace}/${selectedProject}/${initialData?.id}`,
        {
          body: JSON.stringify(payload),
          method: "PATCH",
        },
      );

      const data = await response.json();

      if (!data.success) throw new Error(data.error);
      return data.task;
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess(task) {
      if (!selectedWorkspace || !selectedProject || !initialData?.id) return;
      queryClient.setQueryData(
        ["workspace", selectedWorkspace, "projects", selectedProject, "tasks"],
        (tasks: Task[]) =>
          tasks.map((_task) => {
            if (_task.id === initialData?.id) {
              return task;
            }
            return _task;
          }),
      );
      onClose();
    },
  });

  // console.log(assigneeId, initialData?.assigned_to.toString() || "");

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!assigneeId) {
      toast.error("Please assign this task to someone");
      return;
    }

    if (!selectedWorkspace) {
      toast.error("Please select a workspace to add a task");
      return;
    }
    if (!selectedProject) {
      toast.error("Please select a workspace to add a task");
      return;
    }

    (initialData?.id ? updateMutation : createMutation).mutate({
      title,
      description,
      priority,
      status,
      assigned_to: parseInt(assigneeId),
      due_date: dueDate,
      workspace_id: selectedWorkspace,
      project_id: selectedProject,
    });
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#1a1a1f] border border-white/10 p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {initialData?.id ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/60">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500/50"
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/60">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500/50 resize-none min-h-25"
              placeholder="Task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/60">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityEnum.enumValues.map((value) => (
                    <SelectItem key={value} value={value} className="capitalize">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Task["status"])}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusEnum.enumValues.map((value) => (
                    <SelectItem key={value} value={value} className="capitalize">
                      {columnsTitle[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/60">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60">Due Date</Label>
              <Input
                type="date"
                min={minDate}
                value={dueDate ? new Date(dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setDueDate(e.target.value ? new Date(e.target.value).toISOString() : "")
                }
                className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500/50 block"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white border-0">
              {initialData?.id ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
