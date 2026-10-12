const { body, query } = require('express-validator');
const { idParam, paginationQuery, validateRequest } = require('./common');

const authorBody = [
  body('name')
    .trim()
    .notEmpty().withMessage('Author name is required').bail()
    .isLength({ max: 100 }).withMessage('Author name must be at most 100 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required').bail()
    .isEmail().withMessage('Email must be a valid email address').bail()
    .isLength({ max: 150 }).withMessage('Email must be at most 150 characters'),
  body('publisherId')
    .notEmpty().withMessage('publisherId is required').bail()
    .isInt({ min: 1, max: 2147483647 }).withMessage('publisherId must be a positive whole number')
    .toInt(),
];

exports.listAuthors = [
  ...paginationQuery,
  query('q').optional().trim().isLength({ max: 100 }).withMessage('q must be at most 100 characters'),
  query('publisherId')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 2147483647 })
    .withMessage('publisherId must be a positive whole number')
    .toInt(),
  validateRequest,
];
exports.authorId = [idParam, validateRequest];
exports.authorBooks = [idParam, ...paginationQuery, validateRequest];
exports.createAuthor = [...authorBody, validateRequest];
exports.updateAuthor = [idParam, ...authorBody, validateRequest];
