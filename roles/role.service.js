const config = require('config.json');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var path = require("path");
const role = db.Role;

module.exports = {
    create,
    list,
    view,
    update,
    remove,
    truncate
};

async function create(request) {
    const existing = await role.findOne({ title: request.title });
    
    if (existing) {
        throw 'Already_Exists';
    }

    const record = new role(request);
    return await record.save();
}

async function list(request) {
    let query = request.query;

    let options = {
        limit: parseInt(query.limit>0? query.limit:10),
        page: parseInt(query.page>0? query.page:1),
    }

    delete query['limit'];
    delete query['page'];
    return await role.paginate(query, options);
}

async function view(id) {
    try{
        let result = await role.findById(id);
        if(!result) throw "Not_Found"
        return result;
    }catch(e){
        throw "Bad_Request"
    }
}

async function update(id, request) {
    const record = await role.findById(id);

    if (!record) throw 'Not_Found';
        
    Object.assign(record, request);
    return await record.save();
}

async function remove(id) {
    try{
       let record = await role.findByIdAndRemove(id);
       if(!record) throw "Not_Found"
    }catch(e){
        throw "Bad_Request";
    }
}

async function truncate(request) {
    try {
        let result = await user.remove({});
        return result;
    }catch (e) {
        throw "Bad_Request";
    }
}
