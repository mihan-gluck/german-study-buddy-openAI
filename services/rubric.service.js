//services/rubric.service.js

const Rubric = require("../models/Rubric");

async function getRubric(level, taskType) {
  return await Rubric.findOne({ level, taskType });
}
module.exports = { getRubric };

