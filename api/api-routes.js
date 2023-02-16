// api-routes.js
// Initialize express router and cache
const router = require("express").Router();
// const concordium = new Concordium();
const multer = require('multer');
const mime   = require('mime-types');
const fs     = require('fs');
let dirImg   = './image';

if (!fs.existsSync(dirImg)){
    fs.mkdirSync(dirImg);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dirImg);
  },
  filename: function (req, file, cb) {
    const ext = mime.extension(file.mimetype);
    cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
  },
});
const upload = multer({ storage: storage });

// Set default API response
router.get("/", function (req, res) {
  res.status(404).end();
});

// Account routes
const accountController = require("./controllers/accountController");

router.route("/account/v1/:account/nonce").get(accountController.getNonce);

// Product routes
const productController = require("./controllers/productController");

router.route("/product/v1").post(upload.single('file'), productController.add);
router.route("/product/v1/:account").get(productController.list);

// Export API routes
module.exports = router;
