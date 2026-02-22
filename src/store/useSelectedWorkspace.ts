import { create } from "zustand";

interface BoardStore {
  selectedWorkspace: number | undefined;
  setSelectedWorkspace: (view: NonNullable<BoardStore["selectedWorkspace"]>) => void;
}

export const useSelectedWorkspace = create<BoardStore>((set) => ({
  selectedWorkspace: undefined,
  setSelectedWorkspace: (Workspace_id) => set({ selectedWorkspace: Workspace_id }),
}));
