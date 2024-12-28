const express = require('express')
const app = express()
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

// MODDLEWARES
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = [];
const exercises = [];

// Utility function to generate unique ID
const generateId = () => uuidv4().replace(/-/g, '').substring(0, 24);

// Utility function to format date
const formatDate = (date) => date ? new Date(date).toDateString() : new Date().toDateString();

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const _id = generateId();
  users.push({ username, _id });
  res.json({ username, _id });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;
  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  date = formatDate(date);
  const exercise = { description, duration: parseInt(duration), date };
  exercises.push({ ...exercise, _id });
  res.json({ _id, username: user.username, date, duration: parseInt(duration), description });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let log = exercises.filter(exercise => exercise._id === _id);

  if (from) log = log.filter(exercise => new Date(exercise.date) >= new Date(from));

  if (to) log = log.filter(exercise => new Date(exercise.date) <= new Date(to));

  if (limit) log = log.slice(0, +limit);

  log = log.map(({ description, duration, date }) => ({ description, duration, date }));
  res.json({ ...user, count: log.length, log });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
