import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import * as auth from "../lib/auth.js";
import nodemailer from "../lib/nodemailer.js";

export const signup = async (req, res) => {
  const userObj = req.body.data;
  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash(userObj.password, salt);
  userObj.password = hashPass;

  const post = new User(userObj);
  let user;

  try {
    user = await post.save();
    if (user) {
      const transporter = nodemailer.createdTransporter();
      const mailOptions = {
        to: userObj.email,
        subject: `Registration Successfull, Welcome to Scope N' Stack`,
        html: nodemailer.signupEmail(user.username),
      };
      const sentMail = await transporter.sendMail(mailOptions);
      if (sentMail.accepted.length > 0) {
        res.status(200).json({ message: "Signup Successfull, Login to continue" });
      } else {
        // If email sending fails, rollback the user creation
        await User.findByIdAndDelete(user?._id);
        res.status(400).json({ message: "failed to send email" });
      }
    }
  } catch (err) {
    if (user) {
      await User.findByIdAndDelete(user?._id);
    }
    res.status(400).json({ message: `Error while signing up due to ${err}` });
  }
};

export const login = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.body.email }).exec();
    const validPass = await bcrypt.compare(req.body.password, userData.password);
    if (!validPass) {
      res.status(400).json({ message: "Invalid Password entered" });
    }
    if (userData.status == "INACTIVE") {
      res.status(400).json({ message: "User is inactive, Contact Admin" });
    }
    const newToken = auth.createToken(userData._id, req.body.email);
    if (newToken.status) {
      try {
        const updateDataObj = {};
        updateDataObj.tokenStatus = true;
        updateDataObj.tokenCreatedAt = Date.now();
        const result = await User.findByIdAndUpdate({ _id: userData._id }, updateDataObj, {
          new: true,
        }).exec();
        res.cookie("authtoken", newToken.token);

        res.status(200).json({ results: result, message: "Logged in successfully" });
      } catch (error) {
        console.error("Unable to update token status due to " + error.message);
      }
    } else {
      res.status(400).json({ message: "Invalid authtoken" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Unable find the user. User doesnot exist with this email", error });
  }
};

