import jwt from "jsonwebtoken";
import userModel from "../models/User.js";

const checkUserAuth = async (req, res, next) => {
  let token;
  console.log(token)
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      // get token from header
      token = authorization.split(" ")[1];

      // verify token
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // get user from token
      req.user = await userModel.findById(userID).select('-password');
      next();
    } catch (error) {
      console.log(error);
      res.status(401).send({ status: "Unauthorized user" });
    }
  }
  if (!token) {
    res.status(401).send({ status: "Unauthorized user, no token" });
  }
};

export default checkUserAuth;
