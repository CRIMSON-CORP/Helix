import { checkAuth } from "../utils";
import db from "../db";
import { task } from "../db/schema";
import { and, eq } from "drizzle-orm";
import {
  createTaskSchema,
  ProjectParamsSchema,
  TaskParamsSchema,
  WorkspaceParamsSchema,
} from "@/schemas/zod";
import { prettifyError } from "zod";

const routes: Bun.Serve.Options<undefined, `/api/tasks${string}`>["routes"] = {
  "/api/tasks/:workspace_id": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const result = WorkspaceParamsSchema.safeParse(req.params);

      if (!result.success) {
        return Response.json(
          { success: false, error: prettifyError(result.error) },
          { status: 400 },
        );
      }

      const tasks = await db
        .select()
        .from(task)
        .where(eq(task.workspace_id, parseInt(result.data.workspace_id)));

      return Response.json({ success: true, tasks }, { status: 200 });
    },
  },
  "/api/tasks/:workspace_id/:project_id": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const result = WorkspaceParamsSchema.and(ProjectParamsSchema).safeParse(req.params);

      if (!result.success) {
        return Response.json(
          { success: false, error: prettifyError(result.error) },
          { status: 400 },
        );
      }

      const tasks = await db
        .select()
        .from(task)
        .where(
          and(
            eq(task.workspace_id, parseInt(result.data.workspace_id)),
            eq(task.project_id, parseInt(result.data.project_id)),
          ),
        );

      return Response.json({ success: true, tasks }, { status: 200 });
    },
    POST: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();

      const paramsResult = WorkspaceParamsSchema.and(ProjectParamsSchema).safeParse(req.params);
      const bodyResult = createTaskSchema.safeParse(body);

      if (!paramsResult.success) {
        return Response.json(
          { success: false, error: prettifyError(paramsResult.error) },
          { status: 400 },
        );
      }
      if (!bodyResult.success) {
        return Response.json(
          { success: false, error: prettifyError(bodyResult.error) },
          { status: 400 },
        );
      }

      const [newTask] = await db
        .insert(task)
        .values({
          title: bodyResult.data.title,
          description: bodyResult.data.description,
          due_date: bodyResult.data.due_date,
          assigned_to: bodyResult.data.assigned_to,
          priority: bodyResult.data.priority,
          status: bodyResult.data.status,
          project_id: parseInt(paramsResult.data.project_id),
          workspace_id: parseInt(paramsResult.data.workspace_id),
        })
        .returning();

      return Response.json(
        {
          success: true,
          task: newTask,
        },
        { status: 201 },
      );
    },
  },
  "/api/tasks/:workspace_id/:project_id/:task_id": {
    PATCH: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const body = await req.json();

      const paramsResult = WorkspaceParamsSchema.and(ProjectParamsSchema)
        .and(TaskParamsSchema)
        .safeParse(req.params);

      const bodyResult = createTaskSchema.partial().safeParse(body);

      if (!paramsResult.success) {
        return Response.json(
          { success: false, error: prettifyError(paramsResult.error) },
          { status: 400 },
        );
      }
      if (!bodyResult.success) {
        return Response.json(
          { success: false, error: prettifyError(bodyResult.error) },
          { status: 400 },
        );
      }

      const [newTask] = await db
        .update(task)
        .set({
          title: bodyResult.data.title,
          description: bodyResult.data.description,
          due_date: bodyResult.data.due_date,
          assigned_to: bodyResult.data.assigned_to,
          priority: bodyResult.data.priority,
          status: bodyResult.data.status,
        })
        .where(
          and(
            eq(task.id, parseInt(paramsResult.data.task_id)),
            eq(task.workspace_id, parseInt(paramsResult.data.workspace_id)),
            eq(task.project_id, parseInt(paramsResult.data.project_id)),
          ),
        )
        .returning();

      return Response.json(
        {
          success: true,
          task: newTask,
        },
        { status: 200 },
      );
    },
    DELETE: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const paramsResult = WorkspaceParamsSchema.and(ProjectParamsSchema)
        .and(TaskParamsSchema)
        .safeParse(req.params);

      if (!paramsResult.success) {
        return Response.json(
          { success: false, error: prettifyError(paramsResult.error) },
          { status: 400 },
        );
      }

      await db
        .delete(task)
        .where(
          and(
            eq(task.id, parseInt(paramsResult.data.task_id)),
            eq(task.workspace_id, parseInt(paramsResult.data.workspace_id)),
          ),
        );

      return Response.json({ success: true }, { status: 200 });
    },
  },
  "/api/tasks/my/:workspace_id": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const result = WorkspaceParamsSchema.safeParse(req.params);

      if (!result.success) {
        return Response.json(
          { success: false, error: prettifyError(result.error) },
          { status: 400 },
        );
      }

      const tasks = await db
        .select()
        .from(task)
        .where(
          and(
            eq(task.assigned_to, user.id),
            eq(task.workspace_id, parseInt(result.data.workspace_id)),
          ),
        );

      return Response.json({ success: true, tasks }, { status: 200 });
    },
  },
};

export default routes;
