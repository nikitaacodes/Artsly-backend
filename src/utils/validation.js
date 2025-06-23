const validator = require("validator");

const validateSignUpData = (req) => {
  const { name, emailId, password } = req.body;
  if (!name) {
    throw new Error("name required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("email isnt valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("enter stronger password");
  }
};

module.exports = {
  validateSignUpData,
};
