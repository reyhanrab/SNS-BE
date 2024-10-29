import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "campaign", // Reference to the Campaign model
    required: true,
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Reference to the User (Volunteer) model
    required: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now, // Automatically set the date of registration
    required: true,
  },
  status: {
    type: String,
    enum: ["registered", "checked-in", "completed"], // Status of the volunteer in the campaign
    default: "registered",
    required: true,
  },
  checkInDate: {
    type: Date,
    default: null, // This is only set when the volunteer checks in
  },
});

const Registration = mongoose.model("registration", registrationSchema);

export default Registration;