const router = require('express').Router();
const c = require('../controllers/dashboardController');

router.get('/stats', c.getStats);
router.get('/recent-books', c.getRecentBooks);

module.exports = router;
