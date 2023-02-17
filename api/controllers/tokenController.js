// Import models
const Product = require("../models/productModel");
exports.list = async (req, res) => {
  const token = req.params.token;
  const products = await Product.find().where("nftToken").in(token).exec();
  res.json(
      products.map((product) => {
            return {
                name: product.name,
                unique: true,
                description: product.description,

                thumnail: { url: product.main_image},
                display: { url: product.main_image},
                attributes: [{
                    type: typeof product.nftToken,
                    name: product.sku,
                    value: product.nftToken,
                }],
            };
      })
  );
};
