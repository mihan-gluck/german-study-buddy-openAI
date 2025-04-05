const express = require("express");
const router = express.Router();
const Subscription = require("../models/subscriptions");

// Create a new subscription
router.post("/", async (req, res) => {
  try {
    const { userId, type, startDate, expiryDate } = req.body;
    const newSubscription = new Subscription({ userId, type, startDate, expiryDate });
    await newSubscription.save();
    res.status(201).json(newSubscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all subscriptions
router.get("/", async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate("userId");
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
