import { useState } from "react";
import { Button } from "../common/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetch";
import { toast } from "react-hot-toast";
import { Layout } from "lucide-react";

export function CreateWorkspaceView() {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🚀");

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
      toast.success("Workspace created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, icon });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-linear-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/20 mb-6 group transition-all duration-300 hover:scale-110">
            <Layout className="h-10 w-10 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Welcome to Helix</h1>
          <p className="text-white/40 text-lg max-w-md mx-auto">
            Get started by creating your first workspace. This is where all your projects and tasks
            will live.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2 ml-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 placeholder:text-white/20"
                placeholder="e.g. Design Studio, Dev Ops..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2 ml-1">
                Icon (Emoji)
              </label>
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl shadow-inner shadow-purple-500/10">
                  {icon}
                </div>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10"
                  placeholder="🚀"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-lg border-0 shadow-lg shadow-purple-600/20 transition-all hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating..." : "Create Workspace"}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-white/20 text-sm italic">
          Tip: You can change the workspace icon and name anytime in settings.
        </p>
      </div>
    </div>
  );
}
