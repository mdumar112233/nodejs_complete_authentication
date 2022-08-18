import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import userModel from "../models/User.js";

export const userSignUp = async (req, res) => {
  try {
    if (req.body !== undefined) {
      const { name, email, password, password_confirm, tc } = req.body;
      const user = await userModel.findOne({ email: email });
      if (user) {
        res.send({ status: "failed", message: "Email already exist !" });
      } else {
        if (name && email && password && password_confirm && tc) {
          if (password === password_confirm) {
            try {
              const salt = await bcrypt.genSalt(10);
              const hashPass = await bcrypt.hash(password, salt);
              const doc = new userModel({
                name: name,
                email: email,
                password: hashPass,
                tc: tc,
              });
              await doc.save();
              const save_user = await userModel.findOne({ email: email });
              // Generate jwt token
              const token = jwt.sign(
                { userID: save_user._id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "1d" }
              );
              res
                .status(201)
                .send({ status: "user create successfully", token: token });
            } catch (error) {
              res.send({
                status: "failed",
                message: "unable to signUp try again!",
              });
            }
          } else {
            res.send({
              status: "failed",
              message: "Password are confirm password is not match!",
            });
          }
        } else {
          res.send({ status: "failed", message: "All fields are required" });
        }
      }
    } else {
      res.send({
        status: "failed",
        message: "all field is required. fill all the requirement",
      });
    }
  } catch (error) {
    console.log(error, "item not found");
  }
};

// login controller
export const login = async (req, res) => {
  try {
    if (req.body !== undefined) {
      const { email, password } = req.body;
      if (email && password) {
        const user = await userModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            // Generate token
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "1d" }
            );
            res.send({
              status: "success",
              message: "login successful",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email or password is not valid ! try again",
            });
          }
        } else {
          res.send({ status: "failed", message: "user is not register" });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required!" });
      }
    } else {
      res.send({ status: "failed", message: "All fields are required! 1 " });
    }
  } catch (error) {
    console.log(error);
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    if (req.body !== undefined) {
      const { password, password_confirm } = req.body;
      if (password && password_confirm) {
        if (password !== password_confirm) {
          res.send({
            status: "failed",
            message: "password and confirm password is not match",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const hashPass = await bcrypt.hash(password, salt);
          console.log(req.user);
          await userModel.findByIdAndUpdate(req.user._id, {
            $set: {
              password: hashPass,
            },
          });
          res.send({
            status: "success",
            message: "change password successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required!" });
      }
    } else {
      res.send({ status: "failed", message: "All fields are required! 1" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const sendUserPasswordResetEmail = async (req, res) => {
  const { email } = req.body;
  if (email) {
    try {
      const user = await userModel.findOne({ email: email });
      if (user) {
        const token = jwt.sign(
          { userID: user._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" }
        );
        const link = `http://localhost:8000/api/resetpass/${user._id}/${token}`;

        // send email to user
        let info = transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: 'Password reset link',
          html: `<a href=${link}>Click here</a> to reset your password`
        }, (error, info) => {
          if(error) {
            console.log(error)
          } else {
            console.log(info)
          }
        })
        res.send({
          status: "send email",
          message: "Check your email send reset link",
          info: info
        });
        console.log(link);
      } else {
        res.send({ status: "failed", message: "User is not exists" });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.send({ status: "failed", message: "All fields are required! 1" });
  }
};

export const userPasswordReset = async (req, res) => {
  if (req.body !== undefined) {
    const { password, password_confirm } = req.body;
    const { id, token } = req.params;
    const user = await userModel.findById(id);

    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (password && password_confirm) {
        if (password === password_confirm) {
          const salt = await bcrypt.genSalt(10);
          const hashPass = await bcrypt.hash(password, salt);
          await userModel.findByIdAndUpdate(user._id, {
            $set: {
              password: hashPass,
            },
          });
          res.send({
            status: "success",
            message: "change password successfully",
          });
        } else {
          res.send({
            status: "failed",
            message: "password and confirm password is not match",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required!" });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.send({ status: "failed", message: "All fields are required!" });
  }
};
