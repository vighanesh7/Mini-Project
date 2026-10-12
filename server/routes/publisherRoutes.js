const router = require('express').Router();
const c = require('../controllers/publisherController');
const v = require('../validators/publisherValidator');

router.get('/', v.listPublishers, c.getPublishers);
router.post('/', v.createPublisher, c.createPublisher);
router.get('/:id/authors', v.publisherAuthors, c.getPublisherAuthors);
router.get('/:id', v.publisherId, c.getPublisher);
router.put('/:id', v.updatePublisher, c.updatePublisher);
router.delete('/:id', v.publisherId, c.deletePublisher);

module.exports = router;
