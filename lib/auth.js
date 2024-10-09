import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const privateKey = process.env.JWT_PRIVATEKEY;

export const createToken = (id, email) => {
  const payload = {
    userId: id,
    email: email,
  };
  const createOptions = getOptions("createOptions");

  try {
    const token = jwt.sign(payload, privateKey, createOptions);
    return { status: true, token: token };
  } catch (error) {
    return { message: "Error while creating the token due to " + error.message };
  }
};

export const verifyToken = (authtoken, res) => {
  const token = authtoken;
  const verifyOtpions = getOptions("verifyOptions");
  try {
    const payload = jwt.verify(token, privateKey, verifyOtpions);
    return { status: true, payload: payload };
  } catch (error) {
    // res.clearCookie("authtoken");
    // res.redirect("/");
    console.log("error while verifying JWT Token", error.message);
    return { message: error.message };
  }
};

function getOptions(optionsType) {
  const algorithm = optionsType == "createOptions" ? "RS256" : ["RS256"];
  return {
    expiresIn: "3h",
  };
}
