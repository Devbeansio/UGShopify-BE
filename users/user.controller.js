const express = require('express');
const router = express.Router();
const service = require('./user.service');
const languages = require('../_helpers/language_responses')
const responses = require('../_helpers/response_handler')




// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.post('/forgot', resetLink);
router.post('/reset', setPassword);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', deleteUser);
router.delete('/delete/table', truncate);


module.exports = router;
//User login authentication
//req (request) res (response) two parameters
//In response function return user information if found.
function authenticate(req, res, next) {
    service.authenticate(req.body)
        .then(user => user ? res.json({status: true, data: user}) : res.status(400).json({status: false, message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    service.create(req.body)
        .then(response => responses.insertSuccess(res,response))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    service.getAll(req)
        .then(response => response ? res.json(response) : res.sendStatus(401))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    service.getById(req.decoded.sub)
        .then(response => response ? responses.getSuccess(res, response) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    service.getById(req.params.id)
        .then(response => responses.getSuccess(res,response))
        .catch(err => next(err));
}

function update(req, res, next) {
    service.update(req.params.id, req.body, req.decoded)
        .then((response) => responses.updateSuccess(res,response))
        .catch(err => next(err));
}

function resetLink(req, res, next) {
    service.resetLink(req.body)
        .then(response => res.json(response))
        .catch(err => next(err));
        
}

function setPassword(req, res, next) {
    service.setPassword(req.body)
        .then(response => responses.getSuccess(res,response))
        .catch(err => next(err));
}


function deleteUser(req, res, next) {
    service.deleteUser(req.params.id, req.decoded)
        .then(response => responses.deleteSuccess(res,response))
        .catch(err => next(err)); 
}

function truncate(req, res, next) {
    service.truncate(req, req.decoded)
        .then(response => responses.deleteSuccess(res,response))
        .catch(err => next(err));
}