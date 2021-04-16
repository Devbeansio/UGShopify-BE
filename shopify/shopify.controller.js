const express = require('express');
const router = express.Router();
const service = require('./shopify.service');
const languages = require('../_helpers/language_responses')
const responses = require('../_helpers/response_handler')


// routes
router.get('/installation', installation);
router.get('/', getAll);
router.get('/orders', getOrders);
router.get('/:id', getById);
router.delete('/delete/table', truncate);


module.exports = router;

function installation(req, res, next) {
    service.installation(req, res)
        .then(response => response ? res.json(response) : res.sendStatus(401))
        .catch(err => next(err));
}

function getOrders(req, res, next) {
    service.getOrders(req, res)
        .then(response => response ? res.json(response) : res.sendStatus(401))
        .catch(err => next(err));
}


function getAll(req, res, next) {
    service.getAll(req)
        .then(response => response ? res.json(response) : res.sendStatus(401))
        .catch(err => next(err));
}

function getById(req, res, next) {
    service.getById(req.params.id)
        .then(response => responses.getSuccess(res,response))
        .catch(err => next(err));
}

function truncate(req, res, next) {
    service.truncate(req, req.decoded)
        .then(response => responses.deleteSuccess(res,response))
        .catch(err => next(err));
}