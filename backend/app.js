const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'x-secret-key'],
};

app.use(cors(corsOptions));
app.use(express.json());

const secretKey = 'your_secret_key';

const verifySecretKey = (req, res, next) => {
  const key = req.header('x-secret-key');
  if (key === secretKey) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
};

let askedQuestions = {
  easy: [],
  medium: [],
  hard: [],
};

const getQuestion = (difficulty, res) => {
  fs.readFile(`questions/${difficulty}.json`, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading data');
    }
    try {
      const jsonData = JSON.parse(data);
      const questions = jsonData.questions || [];

      let availableQuestions = questions.filter(
        (q) => !askedQuestions[difficulty].includes(q.id)
      );

      if (availableQuestions.length === 0) {
        // Reset asked questions for this difficulty
        askedQuestions[difficulty] = [];
        availableQuestions = questions;
      }

      const randomQuestion =
        availableQuestions[
          Math.floor(Math.random() * availableQuestions.length)
        ];
      askedQuestions[difficulty].push(randomQuestion.id);

      const { answer, ...questionWithoutAnswer } = randomQuestion;
      res.send({ ...questionWithoutAnswer });
    } catch {
      res.status(500).send('Error parsing data');
    }
  });
};

const getAnswer = (difficulty, id, res) => {
  fs.readFile(`questions/${difficulty}.json`, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading data');
    }
    try {
      const jsonData = JSON.parse(data);
      const question = jsonData.questions.find((q) => q.id === parseInt(id));
      if (!question) {
        return res.status(404).send('Question not found');
      }
      res.send({ answer: question.answer });
    } catch {
      res.status(500).send('Error parsing data');
    }
  });
};

app.get('/question/:difficulty', (req, res) => {
  const difficulty = req.params.difficulty.toLowerCase();
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).send('Invalid difficulty level');
  }
  getQuestion(difficulty, res);
});

app.get('/answer/:difficulty/:id', verifySecretKey, (req, res) => {
  const difficulty = req.params.difficulty.toLowerCase();
  const id = req.params.id;
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).send('Invalid difficulty level');
  }
  getAnswer(difficulty, id, res);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
