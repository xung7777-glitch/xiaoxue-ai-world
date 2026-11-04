import { getDatabase } from "@netlify/database";
import { getUser } from "@netlify/identity";

const database = getDatabase();

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const requestOrigin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(requestOrigin) && new URL(requestOrigin).origin === new URL(request.url).origin;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) {
    return new Response("Forbidden", { status: 403 });
  }

  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const userId = user.id || user.sub;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const userMetadata = user.userMetadata || user.user_metadata || {};
  const email = typeof user.email === "string" ? user.email : "";
  const displayName = user.name || userMetadata.full_name || userMetadata.name || email.split("@")[0] || "Google 使用者";
  const photoURL = user.pictureUrl || userMetadata.avatar_url || userMetadata.picture || "";

  try {
    const rows = await database.sql`
      INSERT INTO user_profiles (user_id, email, display_name, photo_url, created_at, updated_at)
      VALUES (${userId}, ${email}, ${displayName}, ${photoURL}, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        photo_url = EXCLUDED.photo_url,
        updated_at = NOW()
      RETURNING user_id, email, display_name, photo_url, created_at, updated_at
    `;
    return Response.json({ profile: rows[0] });
  } catch (error) {
    console.error("Netlify profile database write failed:", error?.name || "Error");
    return Response.json({ error: "Profile storage is temporarily unavailable." }, { status: 503 });
  }
}

export const config = { path: "/api/profile" };
