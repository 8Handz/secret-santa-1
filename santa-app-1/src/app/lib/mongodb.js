// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://samuelpullukaran5:sam123@santa-names.5urny.mongodb.net/?retryWrites=true&w=majority&appName=santa-names";
const dbName = "santa-names";
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

// Function to get the database
async function getDatabase() {
  const client = await clientPromise;
  return client.db(dbName);
}

module.exports = { getDatabase };
