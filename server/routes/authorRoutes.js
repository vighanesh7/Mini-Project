const router = require('express').Router();
const c = require('../controllers/authorController');
const v = require('../validators/authorValidator');

router.get('/', v.listAuthors, c.getAuthors);
router.post('/', v.createAuthor, c.createAuthor);
router.get('/:id/books', v.authorBooks, c.getAuthorBooks);
router.get('/:id', v.authorId, c.getAuthor);
router.put('/:id', v.updateAuthor, c.updateAuthor);
router.delete('/:id', v.authorId, c.deleteAuthor);

module.exports = router;
