module.exports.product = function () {
  return {
    sku: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    nftBlock: {
      type: String,
      required: false,
    },
    nftToken: {
      type: String,
      required: false,
    },
    main_image: {
      type: String,
      required: false,
    },
  };
};
