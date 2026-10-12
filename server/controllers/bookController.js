const { Op, QueryTypes, literal, fn, col } = require('sequelize');
const { sequelize, Book, Author, Publisher } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { getPagination, buildMeta } = require('../utils/pagination');

const DEFAULT_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

// Whitelist: user input can only choose from these columns/directions (never goes into SQL directly).
const SORT_COLUMNS = { title: 'title', price: 'price', stock: 'stock' };

// Include used whenever we return books together with their authors (and each author's publisher).
const authorsInclude = {
  model: Author,
  as: 'authors',
  attributes: ['id', 'name', 'email', 'publisherId'],
  through: { attributes: [] },
  include: [{ model: Publisher, as: 'publisher', attributes: ['id', 'name'] }],
};

async function findBookOr404(id, options = {}) {
  const book = await Book.findByPk(id, options);
  if (!book) throw new AppError(`Book with id ${id} not found`, 404);
  return book;
}

async function assertIsbnFree(isbn, ignoreId) {
  const where = { isbn };
  if (ignoreId) where.id = { [Op.ne]: ignoreId };
  if (await Book.findOne({ where })) {
    throw new AppError(`A book with ISBN "${isbn}" already exists`, 409);
  }
}

// Makes sure every id in authorIds is a real author; returns the de-duplicated id list.
async function validateAuthorIds(authorIds) {
  const ids = [...new Set(authorIds)];
  const found = await Author.findAll({ where: { id: ids }, attributes: ['id'] });
  const foundIds = found.map((a) => a.id);
  const missing = ids.filter((id) => !foundIds.includes(id));
  if (missing.length > 0) {
    throw new AppError(`These author ids do not exist: ${missing.join(', ')}`, 400);
  }
  return ids;
}

const loadBookWithAuthors = (id) => findBookOr404(id, { include: [authorsInclude] });

// ---------------------------------------------------------------------------
// GET /api/books and GET /api/books/search  (same advanced filter handler)
// Two steps: (1) find the ids for the requested page, (2) load those books with authors.
// This keeps pagination correct even though a book can have many authors.
// ---------------------------------------------------------------------------
exports.findBooks = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { q, genre, authorId, publisherId, minPrice, maxPrice, inStock } = req.query;
  const sortBy = SORT_COLUMNS[req.query.sortBy] || 'title';
  const order = String(req.query.order || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
    throw new AppError('minPrice cannot be greater than maxPrice', 400);
  }

  const where = {};
  const andConditions = [];

  if (q) {
    const like = `%${q}%`;
    where[Op.or] = [
      { title: { [Op.like]: like } },
      { isbn: { [Op.like]: like } },
      { genre: { [Op.like]: like } },
    ];
  }
  if (genre) where.genre = genre;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = Number(minPrice);
    if (maxPrice) where.price[Op.lte] = Number(maxPrice);
  }
  if (inStock === 'true') where.stock = { [Op.gt]: 0 };
  if (inStock === 'false') where.stock = 0;

  // Filter by author / publisher using sub-queries on the junction table.
  // authorId and publisherId were validated as integers, and sequelize.escape() quotes them as well.
  if (authorId) {
    andConditions.push({
      id: {
        [Op.in]: literal(
          `(SELECT BookId FROM AuthorBooks WHERE AuthorId = ${sequelize.escape(Number(authorId))})`
        ),
      },
    });
  }
  if (publisherId) {
    andConditions.push({
      id: {
        [Op.in]: literal(
          `(SELECT ab.BookId FROM AuthorBooks ab JOIN Authors a ON a.id = ab.AuthorId ` +
            `WHERE a.publisherId = ${sequelize.escape(Number(publisherId))})`
        ),
      },
    });
  }
  if (andConditions.length > 0) where[Op.and] = andConditions;

  const { rows: idRows, count } = await Book.findAndCountAll({
    attributes: ['id'],
    where,
    order: [[sortBy, order], ['id', 'ASC']],
    limit,
    offset,
  });

  const ids = idRows.map((row) => row.id);
  let books = [];
  if (ids.length > 0) {
    const loaded = await Book.findAll({ where: { id: ids }, include: [authorsInclude] });
    books = ids.map((id) => loaded.find((b) => b.id === id)); // keep the sorted order
  }

  res.json({ success: true, data: books, pagination: buildMeta(page, limit, count) });
});

// GET /api/books/genres  (distinct genres, used by the filter dropdown)
exports.getGenres = asyncHandler(async (req, res) => {
  const rows = await Book.findAll({
    attributes: [[fn('DISTINCT', col('genre')), 'genre']],
    order: [['genre', 'ASC']],
    raw: true,
  });
  res.json({ success: true, data: rows.map((r) => r.genre) });
});

// ---------------------------------------------------------------------------
// GET /api/books/low-stock?threshold=5&page=&limit=
// RAW SQL report. A raw query is a good fit because it joins three tables,
// aggregates authors into one text column (GROUP_CONCAT) and computes stock value.
// Every user value goes through :named replacements, never string concatenation.
// ---------------------------------------------------------------------------
exports.getLowStock = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const threshold = req.query.threshold || DEFAULT_THRESHOLD;

  const rows = await sequelize.query(
    `SELECT b.id, b.title, b.isbn, b.genre, b.price, b.stock,
            ROUND(b.price * b.stock, 2) AS stockValue,
            COALESCE(GROUP_CONCAT(a.name ORDER BY a.name SEPARATOR ', '), '') AS authors
       FROM Books b
       LEFT JOIN AuthorBooks ab ON ab.BookId = b.id
       LEFT JOIN Authors a ON a.id = ab.AuthorId
      WHERE b.stock < :threshold
      GROUP BY b.id, b.title, b.isbn, b.genre, b.price, b.stock
      ORDER BY b.stock ASC, b.title ASC
      LIMIT :limit OFFSET :offset`,
    { replacements: { threshold, limit, offset }, type: QueryTypes.SELECT }
  );

  const [{ total }] = await sequelize.query(
    'SELECT COUNT(*) AS total FROM Books WHERE stock < :threshold',
    { replacements: { threshold }, type: QueryTypes.SELECT }
  );

  const data = rows.map((r) => ({
    ...r,
    price: Number(r.price),
    stockValue: Number(r.stockValue),
    outOfStock: r.stock === 0,
  }));
  res.json({ success: true, threshold, data, pagination: buildMeta(page, limit, Number(total)) });
});

// GET /api/books/:id
exports.getBook = asyncHandler(async (req, res) => {
  const book = await loadBookWithAuthors(req.params.id);
  res.json({ success: true, data: book });
});

// POST /api/books  (book + author links are saved together in ONE transaction)
exports.createBook = asyncHandler(async (req, res) => {
  const { title, isbn, genre, price, stock, authorIds } = req.body;
  await assertIsbnFree(isbn);
  const ids = await validateAuthorIds(authorIds);

  const created = await sequelize.transaction(async (t) => {
    const book = await Book.create({ title, isbn, genre, price, stock }, { transaction: t });
    await book.setAuthors(ids, { transaction: t });
    return book;
  });

  const book = await loadBookWithAuthors(created.id);
  res.status(201).json({ success: true, message: 'Book created', data: book });
});

// PUT /api/books/:id  (authorIds is optional; if sent, the author list is replaced)
exports.updateBook = asyncHandler(async (req, res) => {
  const book = await findBookOr404(req.params.id);
  const { title, isbn, genre, price, stock, authorIds } = req.body;
  await assertIsbnFree(isbn, book.id);
  const ids = authorIds ? await validateAuthorIds(authorIds) : null;

  await sequelize.transaction(async (t) => {
    await book.update({ title, isbn, genre, price, stock }, { transaction: t });
    if (ids) await book.setAuthors(ids, { transaction: t });
  });

  res.json({ success: true, message: 'Book updated', data: await loadBookWithAuthors(book.id) });
});

// PUT /api/books/:id/authors  body: { "authorIds": [1, 2] }
exports.setBookAuthors = asyncHandler(async (req, res) => {
  const book = await findBookOr404(req.params.id);
  const ids = await validateAuthorIds(req.body.authorIds);
  await book.setAuthors(ids);
  res.json({ success: true, message: 'Book authors updated', data: await loadBookWithAuthors(book.id) });
});

// PATCH /api/books/:id/stock  body: { "stock": 12 }
// Why a separate endpoint? The inventory screen only changes one number, so it should not
// have to resend title/ISBN/price/authors (and cannot accidentally change them).
exports.updateStock = asyncHandler(async (req, res) => {
  const book = await findBookOr404(req.params.id);
  await book.update({ stock: req.body.stock });
  res.json({ success: true, message: 'Stock updated', data: book });
});

// DELETE /api/books/:id
exports.deleteBook = asyncHandler(async (req, res) => {
  const book = await findBookOr404(req.params.id);
  await book.destroy();
  res.status(204).send();
});
