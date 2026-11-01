const http = require("http");
const fs = require("fs");
const crypto = require("crypto");

// Load backend/.env if present; existing environment variables take precedence
try {
  process.loadEnvFile();
} catch {
  // No .env file - rely on the environment
}

const port = process.env.PORT || 3000;
const frontendDomain = process.env.FRONTEND_URL || "http://localhost:5173";

// Store active sessions
const activeSessions = new Map();

// ---------------------------------------------------------------------------
// Minimal HTTP plumbing (built on node:http so the backend has no npm
// dependencies to keep patching): CORS, JSON bodies, rate limiting, routing.
// ---------------------------------------------------------------------------

const MAX_BODY_BYTES = 100 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": frontendDomain,
  Vary: "Origin",
};
const corsPreflightHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Session-Id",
  "Content-Length": "0",
};

// Rate limiting - 60 requests per minute per IP (IPv6 grouped by /56 subnet)
const RATE_WINDOW_MS = 1 * 60 * 1000; // 1 minute
const RATE_MAX = 60; // Maximum 60 requests per IP
const rateHits = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateHits) {
    if (entry.resetTime <= now) rateHits.delete(key);
  }
}, RATE_WINDOW_MS).unref();

const rateLimitKey = (ip = "") => {
  if (ip.startsWith("::ffff:")) return ip.slice(7); // IPv4-mapped IPv6
  if (!ip.includes(":")) return ip;
  const [head, tail = ""] = ip.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  const parts = [
    ...headParts,
    ...Array(8 - headParts.length - tailParts.length).fill("0"),
    ...tailParts,
  ].map((p) => parseInt(p, 16) || 0);
  parts[3] &= 0xff00;
  return parts.slice(0, 4).map((p) => p.toString(16)).join(":") + "::/56";
};

const checkRateLimit = (req, res) => {
  const now = Date.now();
  const key = rateLimitKey(req.socket.remoteAddress);
  let entry = rateHits.get(key);
  if (!entry || entry.resetTime <= now) {
    entry = { count: 0, resetTime: now + RATE_WINDOW_MS };
    rateHits.set(key, entry);
  }
  entry.count++;
  res.setHeader(
    "RateLimit-Policy",
    `${RATE_MAX};w=${RATE_WINDOW_MS / 1000}`
  );
  res.setHeader("RateLimit-Limit", RATE_MAX);
  res.setHeader("RateLimit-Remaining", Math.max(0, RATE_MAX - entry.count));
  res.setHeader("RateLimit-Reset", Math.ceil((entry.resetTime - now) / 1000));
  if (entry.count > RATE_MAX) {
    res.status(429).send("Too many requests, please try again later.");
    return false;
  }
  return true;
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    const type = req.headers["content-type"] || "";
    if (!/^application\/json\b/i.test(type)) {
      req.resume();
      return resolve(undefined);
    }
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
      } else {
        chunks.push(chunk);
      }
    });
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(text ? JSON.parse(text) : {});
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });

// Express-style helpers so the route handlers below stay readable
const enhance = (req, res) => {
  req.get = (name) => req.headers[name.toLowerCase()];
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.send = (body) => {
    if (typeof body === "string") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
    } else {
      body = JSON.stringify(body);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    res.setHeader("Content-Length", Buffer.byteLength(body));
    res.end(req.method === "HEAD" ? undefined : body);
    return res;
  };
  res.json = res.send;
};

const routes = [];
const app = {
  get: (path, ...handlers) => routes.push({ method: "GET", path, handlers }),
  post: (path, ...handlers) => routes.push({ method: "POST", path, handlers }),
};

// Case-insensitive, trailing slash optional, ":name" segments become params
const matchRoute = (method, pathname) => {
  const segments = pathname.replace(/\/+$/, "").split("/");
  for (const route of routes) {
    const methodOk =
      route.method === method || (route.method === "GET" && method === "HEAD");
    const routeSegments = route.path.split("/");
    if (!methodOk || routeSegments.length !== segments.length) continue;
    const params = {};
    const matched = routeSegments.every((seg, i) => {
      if (seg.startsWith(":")) {
        if (!segments[i]) return false;
        try {
          params[seg.slice(1)] = decodeURIComponent(segments[i]);
        } catch {
          return false;
        }
        return true;
      }
      return seg.toLowerCase() === segments[i].toLowerCase();
    });
    if (matched) return { handlers: route.handlers, params };
  }
  return null;
};

const runHandlers = (handlers, req, res) => {
  let i = 0;
  const next = () => {
    const handler = handlers[i++];
    if (handler) handler(req, res, next);
  };
  next();
};

const server = http.createServer(async (req, res) => {
  enhance(req, res);
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, corsPreflightHeaders);
      return res.end();
    }
    for (const [name, value] of Object.entries(corsHeaders)) {
      res.setHeader(name, value);
    }
    if (!checkRateLimit(req, res)) return;

    const { pathname } = new URL(req.url, "http://localhost");
    const route = matchRoute(req.method, pathname);
    if (!route) {
      return res.status(404).send(`Cannot ${req.method} ${pathname}`);
    }
    req.params = route.params;
    req.body = (await readJsonBody(req)) ?? {};
    runHandlers(route.handlers, req, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(err.status || 500).send(err.status ? err.message : "Internal Server Error");
    }
  }
});

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

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
