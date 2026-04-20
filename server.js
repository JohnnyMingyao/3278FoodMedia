const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/nearby', require('./routes/nearby'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/query', require('./routes/query'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Foodie Share backend running on port ${config.port}`);
});
