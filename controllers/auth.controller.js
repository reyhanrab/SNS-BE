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

