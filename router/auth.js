const express = require("express");
const authDataModel = require("../models/auth_model.js");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(422).json({ error: "Please provide all fields" });
  }

  try {
    const user = await authDataModel.findOne({ email });

    if (user) {
      return res.status(422).json({ error: "Email already exists" });
    }

    const newUser = new authDataModel({ username, email, password });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Check if the error is a MongoDB duplicate key error
    if (error.code && error.code === 11000) {
      // Duplicate key error
      if (error.message.includes("username")) {
        return res.status(400).send({ error: "Username is unavailable" });
      }
    }

    // For other types of errors
    res.status(500).send({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "Please provide all fields" });
  }

  try {
    const user = await authDataModel.findOne({ email });

    if (!user) {
      return res.status(422).json({ error: "User does not exist" });
    } else {
      //   console.log(user);

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(422).json({ error: "Invalid credentials!" });
      } else {
        // jwt token logic here
        const token = await user.generateAuthToken();
        console.log(token);

        res.cookie("jwtoken", token, {
          expires: new Date(Date.now() + 25892000000),
          httpOnly: true,
          secure: true,
        });
        res.status(200).json({ message: "User logged in successfully", user });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({ error: error });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwtoken", { path: "/" });
  res.status(200).send("User logged out");
});

module.exports = router;
