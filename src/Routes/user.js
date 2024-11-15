const User = require("../Models/User");

const express = require("express");

const router = new express.Router();

router.post("/signup", async (req, res) => {
  try {
    const user = new User({ ...req.body });


    const token = await user.generateAuthToken();
    // console.log("aniwkle", token)
    const saveduser = await user.save();

    res.status(201).json({ token: token, user:saveduser });
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.status(201).json({ token: token });
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

router.get("/getall", async (req, res) => {
  const result = await User.find({});
  res.send(result);
});

module.exports = router;
