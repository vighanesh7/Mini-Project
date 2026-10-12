const { Op } = require('sequelize');
const { Publisher, Author, Book } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

const DEFAULT_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

// GET /api/dashboard/stats?threshold=5
// Every number comes from a real database query.
// "lowStock" = stock above 0 but below the threshold. "outOfStock" = stock is 0.
exports.getStats = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold) > 0 ? Number(req.query.threshold) : DEFAULT_THRESHOLD;

  const [totalPublishers, totalAuthors, totalBooks, copies, outOfStock, lowStock] = await Promise.all([
    Publisher.count(),
    Author.count(),
    Book.count(),
    Book.sum('stock'),
    Book.count({ where: { stock: 0 } }),
    Book.count({ where: { stock: { [Op.gt]: 0, [Op.lt]: threshold } } }),
  ]);

  res.json({
    success: true,
    data: {
      totalPublishers,
      totalAuthors,
      totalBooks,
      totalCopies: copies || 0, // sum() is empty/NaN when there are no books
      outOfStock,
      lowStock,
      lowStockThreshold: threshold,
    },
  });
});

// GET /api/dashboard/recent-books?limit=5
exports.getRecentBooks = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 20);
  const books = await Book.findAll({
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    include: [
      {
        model: Author,
        as: 'authors',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
    ],
  });
  res.json({ success: true, data: books });
});
