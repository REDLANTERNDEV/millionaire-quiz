const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
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
  if (key && key === secretKey) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
};

app.get('/question/:id', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      if (!jsonData.questions) {
        res.status(500).send('Invalid data format');
        return;
      }
      const question = jsonData.questions.find(
        (q) => q.id === parseInt(req.params.id)
      );
      if (question) {
        const { answer, ...questionWithoutAnswer } = question;
        res.send(questionWithoutAnswer);
      } else {
        res.status(404).send('Question not found');
      }
    } catch (parseError) {
      res.status(500).send('Error parsing data');
    }
  });
});

app.get('/answer/:id', verifySecretKey, (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      if (!jsonData.questions) {
        res.status(500).send('Invalid data format');
        return;
      }
      const question = jsonData.questions.find(
        (q) => q.id === parseInt(req.params.id)
      );
      if (question) {
        res.send({ answer: question.answer });
      } else {
        res.status(404).send('Answer not found');
      }
    } catch (parseError) {
      res.status(500).send('Error parsing data');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
