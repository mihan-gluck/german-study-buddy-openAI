// services/grading.service.js

// External deps
const OpenAI = require("openai");

// Internal models/services
const GradingResult = require("../models/GradingResult");
// const Rubric = require("../models/Rubric"); // when you wire real rubrics

// OpenAI client (v6+ SDK)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Main grading function
 * @param {Object} params
 * @param {string} params.assignmentId
 * @param {string} params.studentId
 * @param {string} params.level        // e.g. "A1" | "B2"
 * @param {string} params.taskType     // e.g. "writing"
 * @param {string} params.submissionText // extracted from PDF or text area
 * @returns {Promise<Object>} grading result DTO
 */
async function gradeAssignment({
  assignmentId,
  studentId,
  level,
  taskType,
  submissionText,
}) {
  if (!submissionText || typeof submissionText !== "string") {
    throw new Error("submissionText is required for grading");
  }

  // TODO: replace this with fetching a real rubric from Mongo
  const rubric = getInlineRubric(level, taskType);

  const prompt = buildGradingPrompt({
    level,
    taskType,
    submissionText,
    rubric,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini", // or "o3-mini" if your account has it
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a certified German CEFR examiner. " +
          "You strictly follow the rubric and ALWAYS return valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content;
  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch (err) {
    console.error("Failed to parse model JSON:", rawContent, err);
    throw new Error("Model returned invalid JSON");
  }

  const gradingResultData = {
    assignmentId,
    studentId,
    level,
    taskType,
    overallScore: parsed.overallScore,
    criteria: parsed.criteria,
    feedback: parsed.feedback,
    llmModel: "gpt-4.1-mini",
    llmRawOutput: parsed,
    createdAt: new Date(),
  };

  // If you already have GradingResult model wired, save to Mongo:
  let saved = gradingResultData;
  try {
    saved = await GradingResult.create(gradingResultData);
  } catch (err) {
    console.error("Failed to save GradingResult:", err);
    // You can decide whether to throw or still return gradingResultData
    throw err;
  }

  // Return a DTO suitable for your route
  return {
    id: saved._id,
    assignmentId: saved.assignmentId,
    studentId: saved.studentId,
    level: saved.level,
    taskType: saved.taskType,
    overallScore: saved.overallScore,
    criteria: saved.criteria,
    feedback: saved.feedback,
  };
}

/**
 * Temporary inline rubric – replace with DB lookup later
 */
function getInlineRubric(level, taskType) {
  // Simple example: same rubric for all writing levels; you can branch on level later
  return {
    maxScore: 10,
    criteria: [
      { name: "Task fulfillment", weight: 0.3 },
      { name: "Grammar", weight: 0.3 },
      { name: "Vocabulary", weight: 0.2 },
      { name: "Coherence", weight: 0.2 },
    ],
  };
}

function buildGradingPrompt({ level, taskType, submissionText, rubric }) {
  return `
CEFR level: ${level}
Task type: ${taskType}

Rubric (criteria with weights, total max score ${rubric.maxScore}):
${JSON.stringify(rubric.criteria, null, 2)}

Student's answer (in German):
"""${submissionText}"""

Instructions:
- Evaluate the answer against EACH criterion.
- For each criterion, assign a sub-score between 0 and 1 (inclusive) and add a short German comment.
- Compute an overallScore between 0 and ${rubric.maxScore}.
- Consider ${level} strictness (A1 more tolerant, B2 stricter, especially for Grammatik und Kohärenz).
- Return a JSON object ONLY with:
  - "overallScore": number
  - "criteria": [ { "name": string, "score0to1": number, "comment": string } ]
  - "feedback": short paragraph in German summarizing strengths and weaknesses.

Example JSON:
{
  "overallScore": 7,
  "criteria": [
    {
      "name": "Grammatik",
      "score0to1": 0.7,
      "comment": "Einige Fehler, aber insgesamt gut verständlich."
    }
  ],
  "feedback": "Der Text erfüllt die Aufgabenstellung weitgehend, enthält jedoch einige grammatische Fehler und Wiederholungen."
}
`;
}

module.exports = {
  gradeAssignment,
};
