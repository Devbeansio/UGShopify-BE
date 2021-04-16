const express = require('express');
const router = express.Router();
const service = require('./role.service');
const languages = require('../_helpers/language_responses')
const responses = require('../_helpers/response_handler')

// routes
router.post('/', create);
router.get('/', list);
router.get('/:id', view);
router.put('/:id', update);
router.delete('/:id', remove);
router.delete('/delete/table', truncate);


module.exports = router;


function create(req, res, next) {
    service.create(req.body)
        .then(response => responses.insertSuccess(res,response))
        .catch(err => next(err));
}

function list(req, res, next) {
    service.list(req)
        .then(response => response ? res.json(response) : res.sendStatus(401))
        .catch(err => next(err));
}

function view(req, res, next) {
    service.view(req.params.id)
        .then(response => responses.getSuccess(res,response))
        .catch(err => next(err));
}

function update(req, res, next) {
    service.update(req.params.id, req.body)
        .then((response) => responses.updateSuccess(res,response))
        .catch(err => next(err));
}

function remove(req, res, next) {
    service.remove(req.params.id)
        .then(response => responses.deleteSuccess(res,response))
        .catch(err => next(err));
}

function truncate(req, res, next) {
    service.truncate(req)
        .then(response => responses.deleteSuccess(res,response))
        .catch(err => next(err));
}