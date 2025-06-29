const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      throw new Error("token isnt valid");
    }
    const decodedObj = await jwt.verify(token, "@adkfjakjfeljeijijk");
    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error(" user not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("errror : " + err.message);
  }
};

module.exports = {
  userAuth,
};
