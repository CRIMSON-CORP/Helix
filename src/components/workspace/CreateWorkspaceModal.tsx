import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../common/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetch";
import { toast } from "react-hot-toast";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🚀"); // Default emoji logo

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon: string }) => {
      const res = await apiFetch("/api/workspace", {
        method: "POST",
        body: JSON.stringify({ name, icon }),
      });
      const data = await res.json();
      if (!data.success && !res.ok) throw new Error(data.error);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      setName("");
      setIcon("🚀");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    mutation.mutate({ name, icon });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-[#1a1a1f] border border-white/10 p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">New Workspace</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="e.g. Engineering Team"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Icon (Emoji)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="🚀"
              maxLength={2}
              required
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
              Create Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
