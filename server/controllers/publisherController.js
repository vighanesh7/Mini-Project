const { Op } = require('sequelize');
const { Publisher, Author } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { getPagination, buildMeta } = require('../utils/pagination');

// Finds a publisher or throws a 404.
async function findPublisherOr404(id) {
  const publisher = await Publisher.findByPk(id);
  if (!publisher) throw new AppError(`Publisher with id ${id} not found`, 404);
  return publisher;
}

// Throws 409 if another publisher already uses this name.
async function assertNameFree(name, ignoreId) {
  const where = { name };
  if (ignoreId) where.id = { [Op.ne]: ignoreId };
  if (await Publisher.findOne({ where })) {
    throw new AppError(`A publisher named "${name}" already exists`, 409);
  }
}

// GET /api/publishers?q=&page=&limit=
exports.getPublishers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.q) {
    const like = `%${req.query.q}%`;
    where[Op.or] = [{ name: { [Op.like]: like } }, { country: { [Op.like]: like } }];
  }
  const { rows, count } = await Publisher.findAndCountAll({ where, order: [['name', 'ASC']], limit, offset });
  res.json({ success: true, data: rows, pagination: buildMeta(page, limit, count) });
});

// GET /api/publishers/:id
exports.getPublisher = asyncHandler(async (req, res) => {
  const publisher = await findPublisherOr404(req.params.id);
  res.json({ success: true, data: publisher });
});

// POST /api/publishers
exports.createPublisher = asyncHandler(async (req, res) => {
  const { name, country } = req.body;
  await assertNameFree(name);
  const publisher = await Publisher.create({ name, country });
  res.status(201).json({ success: true, message: 'Publisher created', data: publisher });
});

// PUT /api/publishers/:id
exports.updatePublisher = asyncHandler(async (req, res) => {
  const publisher = await findPublisherOr404(req.params.id);
  const { name, country } = req.body;
  await assertNameFree(name, publisher.id);
  await publisher.update({ name, country });
  res.json({ success: true, message: 'Publisher updated', data: publisher });
});

// DELETE /api/publishers/:id
// Deletion strategy: RESTRICT. A publisher that still has authors cannot be deleted,
// so authors are never deleted (or orphaned) silently.
exports.deletePublisher = asyncHandler(async (req, res) => {
  const publisher = await findPublisherOr404(req.params.id);
  const authorCount = await Author.count({ where: { publisherId: publisher.id } });
  if (authorCount > 0) {
    throw new AppError(
      `Cannot delete "${publisher.name}": ${authorCount} author(s) still belong to it. Move or delete those authors first.`,
      409
    );
  }
  await publisher.destroy();
  res.status(204).send();
});

// GET /api/publishers/:id/authors
exports.getPublisherAuthors = asyncHandler(async (req, res) => {
  const publisher = await findPublisherOr404(req.params.id);
  const { page, limit, offset } = getPagination(req.query);
  const { rows, count } = await Author.findAndCountAll({
    where: { publisherId: publisher.id },
    order: [['name', 'ASC']],
    limit,
    offset,
  });
  res.json({ success: true, data: rows, pagination: buildMeta(page, limit, count) });
});
