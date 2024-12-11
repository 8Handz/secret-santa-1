import { getDatabase } from "../../lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection("santa-names"); // Your collection name

    const data = await collection.findOne({});

    return new Response(JSON.stringify(data.pickedNames), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const { arrayIndex, newName } = await req.json();

    if (arrayIndex === undefined || !newName) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
      });
    }

    const db = await getDatabase();
    const collection = db.collection("santa-names");
    const firstDocument = await collection.findOne({});

    if (!firstDocument) {
      return new Response(JSON.stringify({ error: "No document found" }), {
        status: 404,
      });
    }

    // Validate the structure of the `names` array
    if (
      !firstDocument.names[arrayIndex] ||
      firstDocument.names[arrayIndex].length < 3
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid array index or structure" }),
        { status: 400 }
      );
    }

    // Update the specific value
    const setResult = await collection.updateOne(
      { _id: firstDocument._id },
      { $set: { [`names.${arrayIndex}.2`]: newName } }
    );
    console.log("Set result:", setResult);

    // Remove from the `pickedNames` array
    const pullResult = await collection.updateOne(
      { _id: firstDocument._id },
      { $pull: { pickedNames: newName } }
    );
    console.log("Pull result:", pullResult);

    return new Response(
      JSON.stringify({ success: true, setResult, pullResult }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating name:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
      {
        status: 500,
      }
    );
  }
}
