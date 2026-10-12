const { Op } = require('sequelize');
const { Author, Publisher, Book } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { getPagination, buildMeta } = require('../utils/pagination');

const publisherInclude = { model: Publisher, as: 'publisher', attributes: ['id', 'name', 'country'] };

async function findAuthorOr404(id, options = {}) {
  const author = await Author.findByPk(id, options);
  if (!author) throw new AppError(`Author with id ${id} not found`, 404);
  return author;
}

// publisherId must point at a real publisher (400 otherwise).
async function assertPublisherExists(publisherId) {
  if (!(await Publisher.findByPk(publisherId))) {
    throw new AppError(`publisherId ${publisherId} does not exist`, 400);
  }
}

async function assertEmailFree(email, ignoreId) {
  const where = { email };
  if (ignoreId) where.id = { [Op.ne]: ignoreId };
  if (await Author.findOne({ where })) {
    throw new AppError(`An author with email "${email}" already exists`, 409);
  }
}

// GET /api/authors?q=&publisherId=&page=&limit=
exports.getAuthors = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.q) {
    const like = `%${req.query.q}%`;
    where[Op.or] = [{ name: { [Op.like]: like } }, { email: { [Op.like]: like } }];
  }
  if (req.query.publisherId) where.publisherId = req.query.publisherId;

  const { rows, count } = await Author.findAndCountAll({
    where,
    include: [publisherInclude],
    order: [['name', 'ASC']],
    limit,
    offset,
  });
  res.json({ success: true, data: rows, pagination: buildMeta(page, limit, count) });
});

// GET /api/authors/:id  (includes publisher and books)
exports.getAuthor = asyncHandler(async (req, res) => {
  const author = await findAuthorOr404(req.params.id, {
    include: [
      publisherInclude,
      { model: Book, as: 'books', through: { attributes: [] } },
    ],
  });
  res.json({ success: true, data: author });
});

// POST /api/authors
exports.createAuthor = asyncHandler(async (req, res) => {
  const { name, email, publisherId } = req.body;
  await assertPublisherExists(publisherId);
  await assertEmailFree(email);
  const created = await Author.create({ name, email, publisherId });
  const author = await findAuthorOr404(created.id, { include: [publisherInclude] });
  res.status(201).json({ success: true, message: 'Author created', data: author });
});

// PUT /api/authors/:id
exports.updateAuthor = asyncHandler(async (req, res) => {
  const author = await findAuthorOr404(req.params.id);
  const { name, email, publisherId } = req.body;
  await assertPublisherExists(publisherId);
  await assertEmailFree(email, author.id);
  await author.update({ name, email, publisherId });
  const updated = await findAuthorOr404(author.id, { include: [publisherInclude] });
  res.json({ success: true, message: 'Author updated', data: updated });
});

// DELETE /api/authors/:id  (AuthorBooks rows are removed by ON DELETE CASCADE)
exports.deleteAuthor = asyncHandler(async (req, res) => {
  const author = await findAuthorOr404(req.params.id);
  await author.destroy();
  res.status(204).send();
});

// GET /api/authors/:id/books
exports.getAuthorBooks = asyncHandler(async (req, res) => {
  const author = await findAuthorOr404(req.params.id);
  const { page, limit, offset } = getPagination(req.query);
  const [books, total] = await Promise.all([
    author.getBooks({ joinTableAttributes: [], order: [['title', 'ASC']], limit, offset }),
    author.countBooks(),
  ]);
  res.json({ success: true, data: books, pagination: buildMeta(page, limit, total) });
});
