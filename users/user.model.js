const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
       
    email: { type: String, required: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true, default: "" },
    contact: { type: String, required:false },
    role: {type: String, required: true, default: ""},
    created_at: {type: Date, required: true, default: Date.now},
    updated_at: {type: Date, required: true, default: Date.now},
    export_options: {type: Array, required: false, default: null},
    column_options: {type: Array, required: false, default: null},
    status: { type: Number, required: false, default: 1},
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('user', schema);