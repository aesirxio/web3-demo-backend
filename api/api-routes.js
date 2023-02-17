// api-routes.js
// Initialize express router and cache
const router = require("express").Router();
// const concordium = new Concordium();
const multer = require('multer');

// Set default API response
router.get("/", function (req, res) {
  res.status(404).end();
});

// Account routes
const accountController = require("./controllers/accountController");

router.route("/account/v1/:account/nonce").get(accountController.getNonce);

// Product routes
const productController = require("./controllers/productController");

router.route("/product/v1").post(multer().single('main_image'), productController.add);
router.route("/product/v1/:account").get(productController.list);

// Token routes
const tokenController = require("./controllers/tokenController");

router.route("/token/v1/:token").get(tokenController.list);

// Export API routes
module.exports = router;
