module.exports.account = function () {
  return {
    address: {
      type: String,
      required: true,
    },
    nonce: {
      type: Number,
      required: true,
    },
  };
};
