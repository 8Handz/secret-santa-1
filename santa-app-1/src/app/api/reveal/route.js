import { getDatabase } from "../../lib/mongodb";

export const dynamic = "force-dynamic";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

// The client only sends its secret key. All lookups and the random pick
// happen here, and only the caller's own result is ever returned.
export async function POST(req) {
  try {
    const { key } = await req.json();

    if (typeof key !== "string" || key === "") {
      return json({ error: "Invalid secret key" }, 400);
    }

    const collection = (await getDatabase()).collection("santa-names");

    // Retry a few times in case two people reveal at the same moment.
    for (let attempt = 0; attempt < 5; attempt++) {
      const doc = await collection.findOne({});
      if (!doc) return json({ error: "No data found" }, 404);

      const index = doc.names.findIndex((entry) => entry[1] === key);
      if (index === -1) return json({ error: "Invalid secret key" }, 401);

      const [user, , assigned] = doc.names[index];

      // Already revealed: return the same result again.
      if (assigned) return json({ user, pickedName: assigned });

      const candidates = (doc.pickedNames ?? []).filter((n) => n !== user);
      if (candidates.length === 0) {
        return json({ error: "No other names available" }, 409);
      }
      const pickedName =
        candidates[Math.floor(Math.random() * candidates.length)];

      // Atomic: only succeeds if this person is still unassigned and the
      // name is still in the pool.
      const result = await collection.updateOne(
        {
          _id: doc._id,
          [`names.${index}.2`]: "",
          pickedNames: pickedName,
        },
        {
          $set: { [`names.${index}.2`]: pickedName },
          $pull: { pickedNames: pickedName },
        }
      );

      if (result.modifiedCount === 1) return json({ user, pickedName });
    }

    return json({ error: "Please try again" }, 503);
  } catch (error) {
    console.error("Error revealing name:", error);
    return json({ error: "Internal Server Error" }, 500);
  }
}
