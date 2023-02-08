// accountController.js
const fs = require("fs");

// Import account model
const Account = require("../models/accountModel");

exports.getNonce = async (req, res) => {
  const nonce = Math.floor(Math.random() * 999999999) + 1;

  Account.findOne({ address: req.params.account }, (err, account) => {
    if (err) {
      res.status(500).end();
      return;
    }
    if (account === null) {
      Account.create({ address: req.params.account, nonce: nonce });
      res.json({
        nonce: nonce,
      });
      return;
    }
    Account.updateOne({ address: req.params.account }, { nonce: nonce }, () => {
      res.json({
        nonce: nonce,
      });
    });
    return;
  });
};
