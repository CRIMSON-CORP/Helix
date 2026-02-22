import { priorityEnum, statusEnum } from "@/server/db/schema";
import { z } from "zod";

export const signUpUserSchema = z.object({
  name: z.string().min(3, "name must not be less than 3 Characters").max(255),
  email: z.email("Please provide a valid email!"),
  username: z.string().min(3, "Username must not be less than 3 Characters").max(255),
  password: z.string().min(8, "Password must not be less than 3 Characters").max(255),
});

export const signInUserSchema = z.object({
  username: z.string().min(3, "Username must not be less than 3 Characters").max(255),
  password: z.string().min(8, "Password must not be less than 3 Characters").max(255),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(3, "Name must not be less than 3 Characters").max(255),
  icon: z.string().max(2, "Icon must be a single character"),
});

export const createProjectSchema = z.object({
  name: z.string().min(3, "Name must not be less than 3 Characters").max(255),
  description: z.string().min(3, "Description must not be less than 3 Characters"),
  workspace_id: z.number("Workspace ID is required"),
});

export const WorkspaceParamsSchema = z.object({
  workspace_id: z.string().min(1, "Workspace ID is required"),
});

export const ProjectParamsSchema = z.object({
  project_id: z.string().min(1, "Project ID is required"),
});

export const TaskParamsSchema = z.object({
  task_id: z.string().min(1, "Project ID is required"),
});

export const createTaskSchema = z.object({
  title: z.string().min(3, "Task title should not be less than 3 characters"),
  description: z.string().min(3, "Task description should not be less than 3 characters"),
  status: z.enum(statusEnum.enumValues, "Status is invalid!"),
  assigned_to: z.int("Assignee Id is required"),
  priority: z.enum(priorityEnum.enumValues, "Priority is invalid"),
  due_date: z
    .string("Due date is required")
    .refine((value) => !isNaN(Date.parse(value)), { error: "Invalid due date!" })
    .refine((value) => {
      const selectedDate = new Date(value);
      const tomorrow = new Date();

      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return selectedDate >= tomorrow;
    }),
  project_id: z.int("Project Id is required"),
  workspace_id: z.int("Workspace Id is required"),
});
