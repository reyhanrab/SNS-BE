import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from "../models/payment.model.js";
import Campaign from "../models/campaign.model.js";
import User from "../models/user.model.js";
import nodemailer from "../lib/nodemailer.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRETKEY);

export const donate = async (req, res) => {
  const {
    amount,
    cardHolderName,
    country,
    address,
    cardType,
    currency,
    donor,
    campaignId,
    paymentMethodId,
  } = req.body;

  // Check for required fields
  if (
    !amount ||
    !cardHolderName ||
    !country ||
    !address ||
    !cardType ||
    !currency ||
    !donor ||
    !campaignId
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if the donor exists in the User collection
    const donorData = await User.findById(donor);
    if (!donorData) {
      return res.status(404).json({ error: "Donor not found" });
    }

    // Convert amount to cents if necessary
    const amountInCents = Math.round(amount * 100);

    // Create a PaymentIntent with the specified details
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      payment_method_types: ["card"], // Only accept card payments, preventing redirects
      confirm: true,
      description: `Payment by ${cardHolderName} from ${country}`,
      metadata: {
        cardHolderName,
        country,
        address,
        cardType,
      },
    });

    // After payment is confirmed, save the payment data to the database
    if (paymentIntent.status === "succeeded") {
      const newPayment = new Payment({
        donor,
        amount: amount,
        currency,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        paymentDate: new Date(),
        cardHolderName,
        cardType,
        country,
        address,
        campaign: campaignId, // Store the reference to the campaign
      });

      // Save payment to the database
      const response = await newPayment.save();
      const campaign = await Campaign.findByIdAndUpdate(campaignId, { $inc: { raisedAmount: amount } });

      // Send confirmation email to the donor
      await nodemailer.sendPaymentConfirmation(
        donorData.email, // Use donor's email
        newPayment._id, // Unique registration/payment ID
        campaign.title, // Reference campaign
        amount
      );

      console.log("Payment data saved successfully:", response);
      res.status(200).json({
        message: "Payment successful, Payment data saved successfully",
        result: newPayment,
      });
    } else {
      res.status(400).json({ error: "Payment could not be completed" });
    }
  } catch (error) {
    // Handle any errors that occurred
    console.error("Error processing payment:", error);
    res.status(500).json({ error: error.message });
  }
};