const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: { type: String, required: true },
    is_default: { type: Boolean, required: false, default: false },
    permissions: { type: Array, required: false, default: []},
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('role', schema);