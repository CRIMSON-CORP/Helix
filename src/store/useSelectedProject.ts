import { create } from "zustand";

interface BoardStore {
  selectedProject: number | undefined;
  setSelectedProject: (view: BoardStore["selectedProject"]) => void;
}

export const useSelectedProject = create<BoardStore>((set) => ({
  selectedProject: undefined,
  setSelectedProject: (project_id) => set({ selectedProject: project_id }),
}));
