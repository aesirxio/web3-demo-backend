// productController.js
const fs = require("fs");

// Import product model
const Product = require("../models/productModel");

exports.addProduct = async (req, res) => {
  console.log(req.body);
  await Product.create({
    sku: req.body.sku,
    name: req.body.name,
    description: req.body.description,
    nftBlock: req.body.block,
    nftToken: req.body.token,
  });
  res.status(201);
  res.json({ success: true });
};
