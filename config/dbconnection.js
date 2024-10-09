import mongoose from "mongoose";

export const connect = () => {
  mongoose
    .connect("mongodb+srv://reyhanrab:NeedforSpeed@cluster0.ufcfhbz.mongodb.net/scopenstack", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("connected to MongoDB.."))
    .catch((err) => console.error("could not connect to mongoDB", err));
};
