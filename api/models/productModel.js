// Model.js
const mongoose = require("mongoose");
const definition = require("./def/productDefinition");

// Setup schema
const productSchema = mongoose.Schema(definition.product());

// Export product model
const Product = (module.exports = mongoose.model("product", productSchema));

module.exports.get = function (callback, limit) {
  Product.find(callback).limit(limit);
};
