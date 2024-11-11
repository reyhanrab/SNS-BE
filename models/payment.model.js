import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  amount: { type: Number, required: true }, // in cents
  currency: { type: String, required: true },
  paymentIntentId: { type: String, required: true },
  status: { type: String, enum: ["succeeded", "failed", "pending"], required: true },
  paymentDate: { type: Date, required: true },
  cardHolderName: { type: String, required: true },
  cardType: { type: String, required: true },
  country: { type: String, required: true },
  address: { type: String, required: true },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "campaign", // Reference to Campaign model
    required: true,
  },
});

const Payment = mongoose.model("payment", paymentSchema);

export default Payment;
