const router = require('express').Router();
const c = require('../controllers/bookController');
const v = require('../validators/bookValidator');

// IMPORTANT: fixed paths (/search, /low-stock, /genres) must come BEFORE '/:id',
// otherwise Express would treat the word "search" as an id.
router.get('/', v.searchBooks, c.findBooks);
router.get('/search', v.searchBooks, c.findBooks);
router.get('/low-stock', v.lowStock, c.getLowStock);
router.get('/genres', c.getGenres);
router.post('/', v.createBook, c.createBook);

router.get('/:id', v.bookId, c.getBook);
router.put('/:id', v.updateBook, c.updateBook);
router.delete('/:id', v.bookId, c.deleteBook);
router.put('/:id/authors', v.setAuthors, c.setBookAuthors);
router.patch('/:id/stock', v.updateStock, c.updateStock);

module.exports = router;
