const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
//create middleware with cors

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.set("Access-Control-Allow-Origin");
  res.send("Book shop app!");
});
//mongodb configuration

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://mern-book-shop:Qa7QJqvcifQrbB6Z@cluster0.s46tqis.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create a collection for the dosuments-database
    const booksData = client.db("BookInventory").collection("books");

    //database name -> booksdata
    //insert a book
    // app.post("/upload-book", async (req, res) => {
    //   const data = req.body;
    //   const result = await booksData.insertOne(data);
    //   res.send(result);
    //   console.log(result);
    // });
    app.post("/upload-books", async (req, res) => {
      const dataArray = req.body; // Assuming req.body is an array of objects

      try {
        const result = await booksData.insertMany(dataArray); // Use insertMany to insert multiple documents
        res.status(200).send(result);
        console.log(result);
      } catch (error) {
        res.status(500).send({ error: "Internal Server Error" });
        console.error(error);
      }
    });
    //get all the books

    app.get("/allbooks", async (req, res) => {
      try {
        let query = {};
        if (req.query?.genre) {
          query = { genre: req.query.genre };
        }
        const result = await booksData.find(query).toArray();
        if (result.length === 0) {
          return res
            .status(404)
            .send("No books found for the specified genre.");
        }
        res.send(result);
        console.log(result);
      } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).send("Error fetching books");
      }
    });

    //to update book
    app.patch("book/:id", (req, res) => {
      const id = req.params.id;
      const updateBookData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...updateBookData,
        },
      };
      const options = { upsert: true };
      //update the book data with
      const result = booksData.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    //delete book data
    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await booksData.deleteOne(filter);
      res.send(result);
    });

    // Get all books or filter by genre
    app.get("/allbooks", async (req, res) => {
      try {
        let query = {};
        const requestedGenre = req.query.genre;
        if (requestedGenre) {
          const genreQuery = { genre: { $in: requestedGenre.split(",") } };
          console.log("Genre Query:", genreQuery);
          query = genreQuery;
        }

        const result = await booksData.find(query).toArray();
        console.log("Filtered Result:", result);

        if (result.length === 0) {
          return res
            .status(404)
            .send("No books found for the specified genre.");
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).send("Error fetching books");
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
