const mongoose = require("mongoose");
const productSchema = mongoose.Schema({
    libelle: {type:String, required: true},
    categorie:{type:String, required: true},
    description:{type:String, required: true},
    provenance:{type:String, required: true},
    prix:{type:Number, required: true},
    // urlImage:{type:String, required: true},
    quantity:{type:Number, required: true}
});
module.exports = mongoose.model("Product", productSchema);