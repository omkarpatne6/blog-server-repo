const compression = require("compression");
const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
require("./conn.js");
const app = express();
app.use(compression());
const port = process.env.PORT || 8000;
const cors = require("cors");
const Mydatabase = require("./models/blog_model.js");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true,
  })
);

app.use(require("./router/auth.js"));
const authenticate = require("./middlewares/authenticate.js");

app.post("/addNewBlog", authenticate, async (req, res) => {
  const { name, description } = req.body;
  const userData = req.rootUser;
  const userId = req.userID;

  if (!name || !description) {
    res.status(400).send("Error: Please enter all fields");
  } else {
    try {
      const newBlog = new Mydatabase({
        name,
        email: userData?.email,
        username: userData?.username,
        slug: name
          .split(" ")
          .join("-")
          .replace(/[,*+~.()'"!:@]/g, "")
          .toLowerCase(),
        description,
        userId,
        date: Date(),
        datestring:
          new Date().toDateString() + " " + new Date().toLocaleTimeString(),
      });

      await newBlog.save();
      res.status(201).send("New blog added successfully");
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }
});

// get all blogs from mongodb
app.get("/fetchdata", async (req, res) => {
  try {
    const showdata = await Mydatabase.find();
    res.send(showdata);
  } catch (error) {
    res.send(error);
  }
});

app.get("/fetchUserBlogs", authenticate, async (req, res) => {
  const userId = req.userID; // Get the user ID from the authenticated request

  try {
    // Fetch only blogs for the authenticated user
    const userBlogs = await Mydatabase.find({ userId });
    res.status(200).send(userBlogs);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// show recents last 3 posts
app.get("/recentposts", async (req, res) => {
  try {
    const showdata = await Mydatabase.find().limit(3).sort({ date: -1 });
    res.send(showdata);
  } catch (error) {
    res.send(error);
  }
});

app.get("/getinfo/:slug", async (req, res) => {
  try {
    const showdata = await Mydatabase.findOne({ slug: req.params.slug });
    res.send(showdata);
  } catch (error) {
    res.send(error);
  }
});

app.put("/updateblog/:slug", async (req, res) => {
  const slug = req.params.slug;

  const body = req.body;

  try {
    const update = await Mydatabase.updateMany({ slug }, body, {
      new: true,
      runValidators: true,
    });
    res.json({
      result: update,
      message: "Blog data updated successfully",
    });
  } catch (error) {
    res.send(error);
  }
});

app.delete("/deleteblog/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const update = await Mydatabase.deleteOne(
      { _id },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json({
      result: update,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.send(error);
  }
});

app.get("/", authenticate, (req, res) => {
  const user = req.rootUser;
  res.json({ user });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
