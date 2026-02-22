import { checkAuth } from "../utils";
import db from "../db";
import { user as pgUser } from "../db/schema";

const routes: Bun.Serve.Options<undefined, `/api/users${string}`>["routes"] = {
  "/api/users": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const users = await db.select().from(pgUser);

      return Response.json({ success: true, users }, { status: 200 });
    },
  },
};

export default routes;
