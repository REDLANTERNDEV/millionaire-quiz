const express = require("express");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const port = 3000;
const frontendDomain = process.env.FRONTEND_URL || "http://localhost:5173";

// Store active sessions
const activeSessions = new Map();

const corsOptions = {
  origin: frontendDomain,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "X-Session-Id"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting - 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Maximum 60 requests per IP
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

const verifyReferer = (req, res, next) => {
  const referer = req.get("Referer");
  const origin = req.get("Origin");
  if (referer?.startsWith(frontendDomain) || origin === frontendDomain) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
};

// Session verification middleware
const verifySession = (req, res, next) => {
  const sessionId = req.headers["x-session-id"];

  if (!sessionId || !activeSessions.has(sessionId)) {
    return res.status(401).send("Invalid session");
  }

  const session = activeSessions.get(sessionId);
  const now = Date.now();

  // Delete session after 2 hours
  if (now - session.created > 7200000) {
    activeSessions.delete(sessionId);
    return res.status(401).send("Session expired");
  }

  // Update last activity
  session.lastActivity = now;
  req.session = session;
  req.sessionId = sessionId;

  next();
};

let askedQuestions = {
  easy: [],
  medium: [],
  hard: [],
};

// Session creation endpoint
app.post("/auth/start-game", verifyReferer, (req, res) => {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now();

  activeSessions.set(sessionId, {
    created: timestamp,
    lastActivity: timestamp,
    questionsAsked: { easy: [], medium: [], hard: [] },
  });

  // Clean up old sessions (older than 2 hours)
  const twoHoursAgo = timestamp - 7200000;
  for (const [id, session] of activeSessions) {
    if (session.created < twoHoursAgo) {
      activeSessions.delete(id);
    }
  }

  res.json({ sessionId, expiresIn: 7200000 }); // 2 hours
});

const getQuestion = (difficulty, res, session) => {
  fs.readFile(`questions/${difficulty}.json`, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data");
    }
    try {
      const jsonData = JSON.parse(data);
      const questions = jsonData.questions || [];

      let availableQuestions = questions.filter(
        (q) => !session.questionsAsked[difficulty].includes(q.id)
      );

      if (availableQuestions.length === 0) {
        // Reset asked questions for this difficulty
        session.questionsAsked[difficulty] = [];
        availableQuestions = questions;
      }

      const randomQuestion =
        availableQuestions[
          Math.floor(Math.random() * availableQuestions.length)
        ];
      session.questionsAsked[difficulty].push(randomQuestion.id);

      const { answer, ...questionWithoutAnswer } = randomQuestion;
      res.send({ ...questionWithoutAnswer });
    } catch {
      res.status(500).send("Error parsing data");
    }
  });
};

app.get("/question/:difficulty", verifyReferer, verifySession, (req, res) => {
  const difficulty = req.params.difficulty.toLowerCase();
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return res.status(400).send("Invalid difficulty level");
  }
  getQuestion(difficulty, res, req.session);
});

app.post("/answer", verifyReferer, verifySession, (req, res) => {
  const { difficulty, id, selectedAnswer } = req.body;

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return res.status(400).send("Invalid difficulty level");
  }

  fs.readFile(`questions/${difficulty}.json`, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data");
    }
    try {
      const jsonData = JSON.parse(data);
      const question = jsonData.questions.find((q) => q.id === parseInt(id));
      if (!question) {
        return res.status(404).send("Question not found");
      }

      const isCorrect = selectedAnswer === question.answer;
      res.send({
        answer: question.answer,
        isCorrect: isCorrect,
      });
    } catch {
      res.status(500).send("Error parsing data");
    }
  });
});

app.get(
  "/fiftyfifty/:difficulty/:id",
  verifyReferer,
  verifySession,
  (req, res) => {
    const difficulty = req.params.difficulty.toLowerCase();
    const id = req.params.id;
    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).send("Invalid difficulty level");
    }
    fs.readFile(`questions/${difficulty}.json`, "utf8", (err, data) => {
      if (err) {
        return res.status(500).send("Error reading data");
      }
      try {
        const jsonData = JSON.parse(data);
        const questions = jsonData.questions || [];
        const question = questions.find((q) => q.id === parseInt(id));
        if (!question) {
          return res.status(404).send("Question not found");
        }
        const correctAnswer = question.answer;
        const incorrectAnswers = question.options.filter(
          (option) => option !== correctAnswer
        );
        if (incorrectAnswers.length === 0) {
          return res.status(500).send("No incorrect answers available");
        }
        const randomIncorrectAnswer =
          incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)];
        res.send({
          answers: [correctAnswer, randomIncorrectAnswer],
        });
      } catch {
        res.status(500).send("Error parsing data");
      }
    });
  }
);

app.get(
  "/callfriend/:difficulty/:id",
  verifyReferer,
  verifySession,
  (req, res) => {
    const difficulty = req.params.difficulty.toLowerCase();
    const id = req.params.id;

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).send("Invalid difficulty level");
    }

    fs.readFile("callfriend_responses.json", "utf8", (err, data) => {
      if (err) {
        return res.status(500).send("Error reading call friend responses");
      }
      try {
        const responses = JSON.parse(data);
        // Get a random conversation
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];

        fs.readFile(`questions/${difficulty}.json`, "utf8", (qErr, qData) => {
          if (qErr) {
            return res.status(500).send("Error reading question data");
          }
          try {
            const jsonData = JSON.parse(qData);
            const question = jsonData.questions.find(
              (q) => q.id === parseInt(id)
            );
            if (!question) {
              return res.status(404).send("Question not found");
            }
            res.send({
              conversation: `${randomResponse.message} ${question.answer}`,
            });
          } catch {
            res.status(500).send("Error parsing question data");
          }
        });
      } catch {
        res.status(500).send("Error parsing call friend responses");
      }
    });
  }
);

app.get(
  "/hallassistance/:difficulty/:id",
  verifyReferer,
  verifySession,
  (req, res) => {
    const difficulty = req.params.difficulty.toLowerCase();
    const id = req.params.id;

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).send("Invalid difficulty level");
    }

    fs.readFile(`questions/${difficulty}.json`, "utf8", (err, data) => {
      if (err) {
        return res.status(500).send("Error reading data");
      }
      try {
        const jsonData = JSON.parse(data);
        const question = jsonData.questions.find((q) => q.id === parseInt(id));
        if (!question) {
          return res.status(404).send("Question not found");
        }

        const correctAnswer = question.answer;
        const options = question.options;

        let percentages = options.map(() => Math.random());
        const total = percentages.reduce((acc, val) => acc + val, 0);
        percentages = percentages.map((val) => (val / total) * 100);

        const correctIndex = options.indexOf(correctAnswer);
        const maxPercentage = Math.max(...percentages);
        percentages[correctIndex] = maxPercentage + 10;
        const newTotal = percentages.reduce((acc, val) => acc + val, 0);
        percentages = percentages.map((val) => (val / newTotal) * 100);

        const response = options.map((option, index) => ({
          option,
          percentage: percentages[index].toFixed(2),
        }));

        res.send(response);
      } catch {
        res.status(500).send("Error parsing data");
      }
    });
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
