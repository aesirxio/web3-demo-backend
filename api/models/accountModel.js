// Model.js
const mongoose = require("mongoose");
const definition = require("./def/accountDefinition");

// Setup schema
const accountSchema = mongoose.Schema(definition.account());

// Export Account model
const Account = (module.exports = mongoose.model("account", accountSchema));

module.exports.get = function (callback, limit) {
  Account.find(callback).limit(limit);
};
