import { create } from "zustand";

interface BoardStore {
  view: "dashboard" | "project" | "my-tasks";
  setView: (view: BoardStore["view"]) => void;
}

export const useBoardView = create<BoardStore>((set) => ({
  view: "dashboard",
  setView: (view) => set({ view }),
}));
