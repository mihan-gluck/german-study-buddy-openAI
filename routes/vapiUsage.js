// routes/vapiUsage.js
const express = require('express');
const router = express.Router();
const Usage = require('../models/VapiUsage');

router.post('/', async (req, res) => {
  const { course, assistantID, duration, timestamp } = req.body;

  try {
    const usage = new Usage({ course, assistantID, duration, timestamp });
    await usage.save();
    res.status(201).send({ message: 'Logged successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to log usage' });
  }
});

module.exports = router;
