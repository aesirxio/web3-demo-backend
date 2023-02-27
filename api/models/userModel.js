// Model.js
const mongoose = require("mongoose");
const definition = require("./def/userDefinition");

// Setup schema
const userSchema = mongoose.Schema(definition.user());

// Export product model
const User = (module.exports = mongoose.model("user", userSchema));

module.exports.get = function (callback, limit) {
  User.find(callback).limit(limit);
};
