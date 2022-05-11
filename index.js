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
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("car setup running");
});

app.listen(port, () => {
  console.log("car listening on port");
});
