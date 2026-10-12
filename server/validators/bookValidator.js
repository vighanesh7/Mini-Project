const { body, query } = require('express-validator');
const { idParam, paginationQuery, validateRequest } = require('./common');

const ID_MAX = 2147483647;

const bookFields = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required').bail()
    .isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
  body('isbn')
    .trim()
    .notEmpty().withMessage('ISBN is required').bail()
    .matches(/^[0-9Xx-]{10,17}$/).withMessage('ISBN must be 10-17 characters: digits, X or hyphens'),
  body('genre')
    .trim()
    .notEmpty().withMessage('Genre is required').bail()
    .isLength({ max: 60 }).withMessage('Genre must be at most 60 characters'),
  body('price')
    .notEmpty().withMessage('Price is required').bail()
    .matches(/^\d{1,8}(\.\d{1,2})?$/).withMessage('Price must be a non-negative number with at most 2 decimals')
    .toFloat(),
  body('stock')
    .notEmpty().withMessage('Stock is required').bail()
    .isInt({ min: 0, max: ID_MAX }).withMessage('Stock must be a non-negative whole number')
    .toInt(),
];

const authorIdsRequired = [
  body('authorIds')
    .isArray({ min: 1 }).withMessage('authorIds must be an array with at least one author id'),
  body('authorIds.*').isInt({ min: 1, max: ID_MAX }).withMessage('Every author id must be a positive whole number').toInt(),
];

const authorIdsOptional = [
  body('authorIds').optional().isArray({ min: 1 }).withMessage('authorIds must be an array with at least one author id'),
  body('authorIds.*').isInt({ min: 1, max: ID_MAX }).withMessage('Every author id must be a positive whole number').toInt(),
];

const searchQuery = [
  ...paginationQuery,
  query('q').optional().trim().isLength({ max: 100 }).withMessage('q must be at most 100 characters'),
  query('genre').optional().trim().isLength({ max: 60 }).withMessage('genre must be at most 60 characters'),
  query('authorId').optional({ values: 'falsy' }).isInt({ min: 1, max: ID_MAX }).withMessage('authorId must be a positive whole number').toInt(),
  query('publisherId').optional({ values: 'falsy' }).isInt({ min: 1, max: ID_MAX }).withMessage('publisherId must be a positive whole number').toInt(),
  query('minPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('minPrice must be a non-negative number'),
  query('maxPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('maxPrice must be a non-negative number'),
  query('inStock').optional({ values: 'falsy' }).isIn(['true', 'false']).withMessage('inStock must be true or false'),
  query('sortBy').optional({ values: 'falsy' }).isIn(['title', 'price', 'stock']).withMessage('sortBy must be title, price or stock'),
  query('order').optional({ values: 'falsy' }).isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('order must be ASC or DESC'),
];

exports.searchBooks = [...searchQuery, validateRequest];
exports.lowStock = [
  ...paginationQuery,
  query('threshold').optional().isInt({ min: 1, max: 1000 }).withMessage('threshold must be a whole number between 1 and 1000').toInt(),
  validateRequest,
];
exports.bookId = [idParam, validateRequest];
exports.createBook = [...bookFields, ...authorIdsRequired, validateRequest];
exports.updateBook = [idParam, ...bookFields, ...authorIdsOptional, validateRequest];
exports.setAuthors = [idParam, ...authorIdsRequired, validateRequest];
exports.updateStock = [
  idParam,
  body('stock')
    .notEmpty().withMessage('Stock is required').bail()
    .isInt({ min: 0, max: ID_MAX }).withMessage('Stock must be a non-negative whole number')
    .toInt(),
  validateRequest,
];
