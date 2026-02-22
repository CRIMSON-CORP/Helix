import { checkAuth } from "../utils";
import db from "../db";
import { activity } from "../db/schema";
import { WorkspaceParamsSchema } from "@/schemas/zod";
import { eq } from "drizzle-orm";

const routes: Bun.Serve.Options<undefined, `/api/activities${string}`>["routes"] = {
  "/api/activities": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const activities = await db.select().from(activity).limit(10);

      return Response.json({ success: true, activities }, { status: 200 });
    },
  },
  "/api/activities/:workspace_id": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const result = WorkspaceParamsSchema.safeParse(req.params);

      if (!result.success) {
        return Response.json({ success: false, error: result.error.message }, { status: 400 });
      }

      const activities = await db
        .select()
        .from(activity)
        .where(eq(activity.workspace_id, parseInt(result.data.workspace_id)))
        .limit(10);

      return Response.json({ success: true, activities }, { status: 200 });
    },
  },
};

export default routes;
