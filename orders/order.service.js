const config = require('config.json');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var path = require("path");
const order = db.Order;

module.exports = {
    create,
    list,
    analytics,
    view,
    update,
    bulkUpdate,
    remove,
    truncate
};

async function create(request) {
    const existing = await order.findOne({ title: request.so_number });
    
    if (existing) {
        throw 'Already_Exists';
    }

    const record = new order(request);
    return await record.save();
}

async function list(request) {
    let query = request.query;

    let options = {
        limit: parseInt(query.limit>0? query.limit:10),
        page: parseInt(query.page>0? query.page:1),
    }

    console.log(query);

    delete query['limit'];
    delete query['page'];

    var searchQuery = {};

    if(query.start){
        searchQuery = {created_at : {$gte : query.start}};
    }

    if(query.end){
        searchQuery = {created_at : {$lte : query.end}};
    }

    if(query.start && query.end){
        searchQuery = {created_at : {$gte : query.start, $lte : query.end}};
    }

    var isSearchQuery = false;
    if(query.search){
        if(query.search.length){
            isSearchQuery = true;
            searchQuery[query.search_by] = {$regex: new RegExp(query["search"].trim(), 'i')};
        }
    }

    console.log("Search Query", searchQuery);

    return await order.paginate(searchQuery, options);
}

async function analytics(request) {
    total = await order.find({}).count();
    // fulfilled = await order.find({ fulfillment_status: { $eq: "fulfilled" } });
    // var fulfilled_total = 0;
    // fulfilled.map((val, index)=>{
    //     fulfilled_total += val.total; 
    // });

    // cancelled = await order.find({ fulfillment_status: { $eq: "cancelled" } });
    // var cancelled_total = 0;
    // fulfilled.map((val, index)=>{
    //     fulfilled_total += val.total; 
    // });
    return await order.aggregate([
        {
            $group: {
                _id: null,                
                total: { $sum: 1 },
                total_revenue: { $sum: "$total" },
                fulfilled: { $sum: { $cond: [ {$eq: [ "$fulfillment_status", "fulfilled" ]} , 1, 0] } },
                fulfilled_revenue: { $sum: { $cond: [ {$eq: [ "$fulfillment_status", "fulfilled" ]} , "$total", 0] } },
                cancelled: { $sum: { $cond: [ {$eq: [ "$fulfillment_status", "cancelled" ]} , 1, 0] } },
                cancelled_revenue: { $sum: { $cond: [ {$eq: [ "$fulfillment_status", "cancelled" ]} , "$total", 0] } },
                noresponse: { $sum: { $cond: [ {$eq: [ "$fulfillment_status", "called_unresponsive" ]} , 1, 0] } },
                noresponse_revenue: { $sum: { $cond: [ {$eq: [ "$fulfillment_status", "called_unresponsive" ]} , "$total", 0] } },
                advance_pending: { $sum: { $cond: [ {$eq: [ "$fulfillment_status", "confirmed_advance_awaiting" ]} , 1, 0] } },
                advance_pending_revenue: { $sum: { $cond: [ {$eq: [ "$fulfillment_status", "confirmed_advance_awaiting" ]} , "$total", 0] } },
                manufacturing: { $sum: { $cond: [ {$eq: [ "$manufacturing_status", "manufacturing_timeline" ]} , 1, 0] } },
                manufacturing_revenue: { $sum: { $cond: [ {$eq: [ "$manufacturing_status", "manufacturing_timeline" ]} , "$total", 0] } },
                delivered: { $sum: { $cond: [ {$eq: [ "$delivery_status", 1 ]} , 1, 0] } },
                delivered_revenue: { $sum: { $cond: [ {$eq: [ "$delivery_status", 1 ]} , "$total", 0] } },
                returned: { $sum: { $cond: [ {$eq: [ "$complaint_resolution", "return" ]} , 1, 0] } },
                returned_revenue: { $sum: { $cond: [ {$eq: [ "$complaint_resolution", "return" ]} , "$total", 0] } },
                customization: { $sum: { $cond: [ {$ne: [ "$customizations", [] ]} , 1, 0] } },
                customization_revenue: { $sum: { $cond: [ {$ne: [ "$customizations", [] ]} , "$total", 0] } },
                complaints: { $sum: { $cond: [ {$eq: [ "$complaint", true ]} , 1, 0] } },
                complaints_revenue: { $sum: { $cond: [ {$eq: [ "$complaint", true ]} , "$total", 0] } },
                score_negative: { $sum: { $cond: [ {$and : [{$gte: [ "$score", 1 ]}, {$lte: [ "$score", 4 ]}]} , 1, 0] } },
                score_average: { $sum: { $cond: [ {$and : [{$gte: [ "$score", 5 ]}, {$lte: [ "$score", 7 ]}]} , 1, 0] } },
                score_positive: { $sum: { $cond: [ {$and : [{$gte: [ "$score", 8 ]}, {$lte: [ "$score", 10 ]}]} , 1, 0] } },
                cr_a: { $sum: { $cond: [ {$eq: [ "$cancelled_reason", "No response" ]} , 1, 0] } },
                cr_b: { $sum: { $cond: [ {$eq: [ "$cancelled_reason", "Locally purchased" ]} , 1, 0] } },
                cr_c: { $sum: { $cond: [ {$eq: [ "$cancelled_reason", "Change of mind" ]} , 1, 0] } },
                cr_d: { $sum: { $cond: [ {$eq: [ "$cancelled_reason", "Delivery timeline" ]} , 1, 0] } },
            }
        }
    ]);
    

    // return await order.aggregate([
    //         {
    //             $project: {
    //                 "fulfilled": {
    //                     "$cond": [
    //                         { "$eq": ["fulfilled", "$fulfillment_status"] },
    //                         1,
    //                         0
    //                     ]
    //                 },
    //                 "cancelled": {
    //                     "$cond": [
    //                         { "$eq": ["cancelled", "$fulfillment_status"] },
    //                         1,
    //                         0
    //                     ]
    //                 },
    //                 "no_response": {
    //                     "$cond": [
    //                         { "$eq": ["pending", "$current_status"] },
    //                         1,
    //                         0
    //                     ]
    //                 },
    //                 "advance_pending": {
    //                     "$cond": [
    //                         { "$eq": [[], "$advance_payments"] },
    //                         1,
    //                         0
    //                     ]
    //                 },
    //                 "manufacturing": {
    //                     "$cond": [
    //                         { "$eq": ["manufacturing", "$current_status"] },
    //                         1,
    //                         0
    //                     ]
    //                 },
    //                 "delivered": {
    //                     "$cond": [
    //                         { "$eq": [1, "$delivery_status"] },
    //                         1,
    //                         0
    //                     ]
    //                 },
    //                 "customization": {
    //                     "$cond": [
    //                         { "$ne": [[], "$customizations"] },
    //                         1,
    //                         0
    //                     ]
    //                 },
    //                 "returned": {
    //                     "$cond": [
    //                         { "$eq": [2, "$delivery_status"] },
    //                         1,
    //                         0
    //                     ]
    //                 },
    //                 "complaints": {
    //                     "$cond": [
    //                         { "$eq": [true, "$complaint"] },
    //                         "$total",
    //                         1,
    //                         0
    //                     ]
    //                 }
    //             }
    //         },
    //         {
    //             $group: {
    //                 "_id": null,
    //                 "fulfilled": { $sum: "$fulfilled" },
    //                 "cancelled": { $sum: "$cancelled" },
    //                 "no_response": { $sum: "$no_response" },
    //                 "advance_pending": { $sum: "$advance_pending" },
    //                 "manufacturing": { $sum: "$manufacturing" },
    //                 "delivered": { $sum: "$delivered" },
    //                 "customization": { $sum: "$customization" },
    //                 "returned": { $sum: "$returned" },
    //                 "complaints": { $sum: "$complaints" }
    //             }
    //         }
    //     ])


    // return { 
    //     total: total, 
    //     fulfilled: {revenue: fulfilled_total, count: fulfilled.length},
    // }; 
}


async function view(id) {
    try{
        let result = await order.findById(id);
        if(!result) throw "Not_Found"
        return result;
    }catch(e){
        throw "Bad_Request"
    }
}

async function update(id, request) {
    const record = await order.findById(id);

    if (!record) throw 'Not_Found';
    request.updated_at = new Date();
    Object.assign(record, request);
    return await record.save();
}

async function bulkUpdate(request) {
    console.log(request);
    var ids = request.ids.map(async (id, index)=>{
        const record = await order.findById(id);
        request.data.updated_at = new Date();
        Object.assign(record, request.data);
        await record.save();
    });
    console.log(ids);
    return ids;
}

async function remove(id) {
    try{
       let record = await order.findByIdAndRemove(id);
       if(!record) throw "Not_Found"
    }catch(e){
        throw "Bad_Request";
    }
}

async function truncate(request) {
    try {
        let result = await order.remove({});
        return result;
    }catch (e) {
        throw "Bad_Request";
    }
}
