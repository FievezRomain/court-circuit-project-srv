const mongoose = require("mongoose");
const orderLineSchema = mongoose.Schema({
    idProduct:{type:mongoose.Schema.Types.ObjectId, ref:"Product", required: true},
    idUser:{type:mongoose.Schema.Types.ObjectId,ref:"User", required: true},
    quantity:{type:String, required: true, min: 1},
    price:{type:Number, required: true}
});
const cartSchema = mongoose.Schema({
    items:[orderLineSchema],
    idUser:{type:mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    subTotal:{type: Number, default: 0}
});
module.exports = mongoose.model("Cart", cartSchema);