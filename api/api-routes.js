// api-routes.js
// Initialize express router and cache
const router = require("express").Router();

// Set default API response
router.get("/", function (req, res) {
  res.status(404).end();
});

const accountController = require("./controllers/accountController");

// Export API routes
module.exports = router;
