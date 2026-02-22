import jwt from "jsonwebtoken";
import type { User } from "../db/schema";

function verifyToken(token: string): User | null {
  let result = null;
  jwt.verify(token, process.env.JWT_SECRET!, (err, data) => {
    if (err) {
      result = null;
    } else {
      result = data as Pick<User, "id">;
    }
  });
  return result;
}

function getCookie(req: Request, name: string) {
  const cookieString = req.headers.get("Cookie");

  if (!cookieString) return null;

  const cookies = cookieString.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.split("=").map((c) => c.trim());
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  return cookies[name] || null;
}

async function checkAuth(req: Request) {
  const token = getCookie(req, "accessToken");

  if (!token) {
    return null;
  }
  const result = verifyToken(token);
  if (!result) {
    return null;
  }

  return result as Pick<User, "id">;
}

export { verifyToken, checkAuth, getCookie };
