const { body, query } = require('express-validator');
const { idParam, paginationQuery, validateRequest } = require('./common');

const publisherBody = [
  body('name')
    .trim()
    .notEmpty().withMessage('Publisher name is required').bail()
    .isLength({ max: 100 }).withMessage('Publisher name must be at most 100 characters'),
  body('country')
    .trim()
    .notEmpty().withMessage('Country is required').bail()
    .isLength({ max: 60 }).withMessage('Country must be at most 60 characters'),
];

exports.listPublishers = [
  ...paginationQuery,
  query('q').optional().trim().isLength({ max: 100 }).withMessage('q must be at most 100 characters'),
  validateRequest,
];
exports.publisherId = [idParam, validateRequest];
exports.publisherAuthors = [idParam, ...paginationQuery, validateRequest];
exports.createPublisher = [...publisherBody, validateRequest];
exports.updatePublisher = [idParam, ...publisherBody, validateRequest];
