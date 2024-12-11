import { getDatabase } from "../../lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection("santa-names"); // Your collection name

    const data = await collection.findOne({});

    return new Response(JSON.stringify(data.names), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
