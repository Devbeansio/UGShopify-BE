const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    access_token: { type: String, required: true },
    scope: { type: String, required: true },
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('shopify', schema);