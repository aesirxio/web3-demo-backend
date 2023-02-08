// api-routes.js
// Initialize express router and cache
const router = require("express").Router();

// Set default API response
router.get("/", function (req, res) {
  res.status(404).end();
});

// Account routes
const accountController = require("./controllers/accountController");

router.route("/account/v1/:account/nonce").get(accountController.getNonce);

// Export API routes
module.exports = router;
