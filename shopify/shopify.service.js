const config = require('config.json');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var path = require("path");
const shopify = db.Shopify;
const order = db.Order;
const axios = require('axios');

module.exports = {
    getAll,
    getById,
    installation,
    getOrders,
    truncate
};


async function getAll(request) {
    let query = request.query;
    let options = {
        limit: parseInt(query.limit>0? query.limit:10),
        page: parseInt(query.page>0? query.page:1),
    }
    delete query['limit'];
    delete query['page'];
    return await shopify.paginate(query,options);
}

async function getById(id) {
    try{

        let result= await shopify.findById(id);
        if(!result) throw "Not_found"
        return result;
    }catch(e){
        throw "Not_found"
    }
}


async function installation(request, response) {
    console.log("Body, Query", request.body, request.query);
    var data = {};
    await axios.post(config.SHOP+"admin/oauth/access_token", {
        client_id: config.API_KEY, 
        client_secret: config.API_SECRET_KEY, 
        code: request.query.code?request.query.code: ''
    }).then(async res => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log("Shopify Response", res.data); 
        data = res.data;   
        const record = new shopify(data);
        console.log("Shopify Record", record);
        await record.save();
        response.redirect("http://localhost:3000/installation");
    }).catch(error => {
        console.error("Shopify Error", error);
        console.log("After error");
        response.redirect("http://localhost:3000/failed");
    });
    console.log("Returning", data);
    return data;
}

async function getOrders(request, response) {
    var shopifyAccess = await shopify.find({}).sort({_id:-1}).limit(1);
    console.log("Access", shopifyAccess);
    let conf = {
        headers: {
            'X-Shopify-Access-Token': shopifyAccess[0].access_token,
        }
    };
    console.log(conf);
    var lastOrder = await order.find({}).sort({_id: -1}).limit(1);
    var so_number = 0;
    if(lastOrder.length > 0){
        so_number = lastOrder[0].so_number;
    }
    await axios.get(config.SHOP+"admin/api/2021-04/orders.json?status=any&since_id="+so_number, conf).then(res => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log("Shopify Response", res.data); 
        data = res.data;
        if(data.orders){
            if(data.orders.length){
                var ordersList = data.orders.map((orderObject, index) => {
                    return shopifyToLocalOrder(orderObject);
                });
                try {
                   order.insertMany(ordersList);
                } catch (e) {
                   print (e);
                }
                
            }
        };

    }).catch(error => {
        console.log(error);
        console.log("After error");
        throw "Bad_Request";
    });
    console.log("Shipify Response Data", data);
    let query = request.query;

    let options = {
        limit: parseInt(query.limit>0? query.limit:10),
        page: parseInt(query.page>0? query.page:1),
    }

    delete query['limit'];
    delete query['page'];
    return await order.paginate(query, options);
}


function shopifyToLocalOrder(shopfiyOrder){
    var tempOrder = {
        so_number: shopfiyOrder.id,
        order_name: shopfiyOrder.name,
        current_status: "new",
        created_at: shopfiyOrder.created_at,
        updated_at: shopfiyOrder.created_at,
        customer_name: shopfiyOrder.customer.first_name + " " + shopfiyOrder.customer.last_name,
        customer_contact: shopfiyOrder.customer.phone,
        customer_email: shopfiyOrder.customer.email,
        customer_note: shopfiyOrder.note?shopfiyOrder.note:"",
        items: shopfiyOrder.line_items,
        discount_code: "",
        discount_amount: shopfiyOrder.total_discounts,
        total: shopfiyOrder.total_price,
        total_tax: shopfiyOrder.total_tax,
        address: shopfiyOrder.shipping_address.address1,
        city: shopfiyOrder.shipping_address.city,
        cost: 0,
        responsibility: "customer_service",
        fulfillment_status: shopfiyOrder.fulfillment_status,
        discounts: shopfiyOrder.total_discounts_set,
        advance_payments: [],
        currency: shopfiyOrder.currency,
        pending_payment: shopfiyOrder.total_outstanding,
        po_numbers: [],
        vendors: shopfiyOrder.line_items.map((item, index)=>{ return {item: item.title, vendor: item.vendor}; }),
        customizations: [],
        manufacturing_status: "",
        quality_approved: "",
        quality_reason: "",
        shipment_booking: false,
        shipment_mode: "",
        delivery_status: 0,
        freight_charges: 0,
        shipment_booking_date: "",
        booking_date: "",
        expected_delivery_date: "",
        delivery_date: "",
        delivery_duration: 0,
        feedback: "",
        score: 0,
        order_again: null,
        complaint: null,
        complaint_date: null,
        complaint_detail: "",
        complaint_resolution: "",
        complaint_resolution_date: null,
        complaint_resolution_time: 0,
        follow_up_call: null,
        follow_up_call_progress: []
    };
    return tempOrder;
}



async function truncate(request, decoded) {
    if(decoded.role == "admin"){
        try {
            let result = await user.remove({});
            return result;
        } catch (e) {
            throw "Not_found"
        }
    }else{
        throw "Unauthorized_request";
    }
}
