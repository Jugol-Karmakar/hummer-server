const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

// midleware

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmff0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const carCollection = client.db("hummer").collection("car");
    const itemCollection = client.db("hummer").collection("myitem");

    // get inventory

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = carCollection.find(query);
      const cars = await cursor.toArray();
      res.send(cars);
    });

    app.get("/inventory/filter", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = carCollection.find(query);
      const cars = await cursor.toArray();
      console.log(cars);
      res.send(cars);
    });

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await carCollection.findOne(query);
      res.send(inventory);
    });

    // delete inventory

    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      res.send(result);
    });

    // add new inventory

    app.post("/inventory", async (req, res) => {
      const inventor = req.body;
      const result = await carCollection.insertOne(inventor);
      res.send(result);
    });

    // get new inventory

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = carCollection.findOne(query);
      const item = await cursor.toArray();
      res.send(item);
    });

    // update inventory

    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updateQuantity = req.body;
      console.log(updateQuantity);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateQuantity.quantity,
        },
      };
      const result = await carCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // token
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // get myitem
    app.get("/myitem", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = itemCollection.find(query);
        const myitem = await cursor.toArray();
        res.send(myitem);
      } else {
        res.status(403).send({ message: "Fordidden Access" });
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("car setup is running");
});

app.listen(port, () => {
  console.log("car listening on port");
});
