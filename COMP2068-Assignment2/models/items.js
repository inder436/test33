const mongoose = require('mongoose');
const ItemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    catagory: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: String,
        required: true,
        trim: true
    },
});
const Items = mongoose.model("Items", ItemsSchema);
module.exports = Items;