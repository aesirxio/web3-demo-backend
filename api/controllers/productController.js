// productController.js
const fs = require("fs");

// Import models
const Product = require("../models/productModel");
const Account = require("../models/accountModel");

const Concordium = require("../web3/concordium");
const concordium = new Concordium();

const mime   = require('mime-types');
const multer = require("multer");
let dirImg   = '/image/';

exports.add = async (req, res) => {

  if (!fs.existsSync('.' + dirImg)){
    fs.mkdirSync('.' + dirImg);
  }
    let ext = mime.extension(req.file.mimetype);
    let imageName = req.body.name.replace(/\s/g, '_') + '_' + Date.now() + '.' + ext;

  fs.writeFile('.' + dirImg + imageName, req.file.buffer, (err) => {
    if (err) throw err;
  });

  await Product.create({
    sku: req.body.sku,
    name: req.body.name,
    description: req.body.description,
    nftBlock: req.body.block,
    nftToken: req.body.token,
    main_image: dirImg + imageName,
  });
  res.status(201);
  res.json({ success: true });
};

exports.list = async (req, res) => {
  Account.findOne({ address: req.params.account }, async (err, account) => {
    if (err) {
      res.status(500).end();
      return;
    }

    if (account === null) {
      res.status(404).end();
      return;
    }

    const nonce = account.nonce;

    if (
      !(await concordium.validateAccount(
        String(nonce),
        JSON.parse(Buffer.from(req.query.signature, "base64").toString()),
        account.address
      ))
    ) {
      res.status(403).end();
      return;
    }

    const tokens = await concordium.listNFTs(account.address);
    const products = await Product.find().where("nftToken").in(tokens).exec();
    res.json(
      products.map((product) => {
        return {
          sku: product.sku,
          name: product.name,
          description: product.description,
          block: product.nftBlock,
          token: product.nftToken,
          main_image: product.main_image,
        };
      })
    );
  });
};
