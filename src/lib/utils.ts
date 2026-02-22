import type { Task } from "@/server/db/schema";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const columnsTitle: Record<Task["status"], string> = {
  backlog: "Backlog",
  pending: "In Progress",
  review: "Review",
  completed: "Done",
};
