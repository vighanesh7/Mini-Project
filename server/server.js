require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
const asyncHandler = require('./middleware/asyncHandler');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const publisherRoutes = require('./routes/publisherRoutes');
const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Only the React dev server may call this API from a browser.
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Health check: also proves the database connection works.
app.get(
  '/api/health',
  asyncHandler(async (req, res) => {
    await sequelize.authenticate();
    res.json({ success: true, status: 'ok', database: 'connected' });
  })
);

app.use('/api/publishers', publisherRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

// Test the database connection BEFORE accepting requests.
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection OK');
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}/api`));
  } catch (err) {
    console.error('Could not connect to the database:', err.message);
    console.error('Check MySQL is running and the values in server/.env are correct.');
    process.exit(1);
  }
}

start();
