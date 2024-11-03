import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    unique: true,
  },
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
    enum: ["registered", "checked-in", "checked-out"], // Status of the volunteer in the campaign
    default: "registered",
    required: true,
  },
  checkInDate: {
    type: Date,
    default: null, // This is only set when the volunteer checks in
  },
  checkOutDate: {
    type: Date,
    default: null, // This is only set when the volunteer checks in
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Pre-save hook to generate Registration ID
registrationSchema.pre("save", async function (next) {
  const count = await mongoose.model("registration").countDocuments();
  const paddedId = String(count + 1000).padStart(4, "0"); // Start from 1000
  this.registrationId = `VOLCAMPREG${paddedId}`;
  next();
});

const Registration = mongoose.model("registration", registrationSchema);

export default Registration;
