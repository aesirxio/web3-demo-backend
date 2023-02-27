module.exports.user = function () {
  return {
    id: {
      type: String,
      required: true,
      unique: true
    },
    user_name: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    ccd_account: {
      type: String,
      required: false,
    },
  };
};
