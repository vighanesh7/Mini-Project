const { param, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const idParam = param('id')
  .isInt({ min: 1, max: 2147483647 })
  .withMessage('id must be a positive whole number')
  .toInt();

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a whole number >= 1').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be a whole number between 1 and 100')
    .toInt(),
];

module.exports = { idParam, paginationQuery, validateRequest };
