const config = require('config.json');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

mongoose.plugin(mongoosePaginate);

const mongoConnectWithRetry = () => {
    return mongoose.connect(process.env.MONGODB_URI || config.connectionString, { useCreateIndex: true, useNewUrlParser: true,useUnifiedTopology: true }, err => {
        if(err) {
            console.log('Connection to MongoDB failed. Will retry after 10 seconds ...');
            setTimeout(mongoConnectWithRetry, 10000);
        } else {
            console.log('Connected to MongoDB');
        }
    });
};

mongoConnectWithRetry();

mongoose.Promise = global.Promise;

module.exports = {
    User: require('../users/user.model'),
    Role: require('../roles/role.model'),
    Order: require('../orders/order.model'),
    Shopify: require('../shopify/shopify.model'),
};
