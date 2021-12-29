const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // validation if user is not already registered
  let user = await User.findOne({ email: req.body.email }); 
  if (user)
    return res
      .status(400)
      .send("Try any other email, this email is already registered!");


  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    contactNumber: req.body.contactNumber,
    password: req.body.password,
  });

  const salt = await bcrypt.genSalt(10); // here
  user.password = await bcrypt.hash(user.password, salt); // reset it at lhs

  await user.save();

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send(user);
});

module.exports = router;
