import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../common/Button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetch";
import toast from "react-hot-toast";
import { useSelectedWorkspace } from "@/store/useSelectedWorkspace";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const response = await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          workspace_id: selectedWorkspace,
        }),
      });

      const data = await response.json();

      if (data.success && response.ok) {
        setName("");
        setDescription("");
        onClose();
        return data;
      } else {
        throw new Error(data.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "activities"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    mutate({ name, description });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#1a1a1f] border border-white/10 p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New Project</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/60">
              Project Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500/50"
              placeholder="e.g. Website Redesign"
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
              placeholder="Brief description of the project"
            />
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
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
