// Turns ?page=2&limit=10 into numbers Sequelize understands.
// (Values are already validated by express-validator before we get here.)
function getPagination(query) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  return { page, limit, offset: (page - 1) * limit };
}

function buildMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

module.exports = { getPagination, buildMeta };
