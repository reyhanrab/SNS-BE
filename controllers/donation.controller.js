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
    userId,
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
    !userId ||
    !campaignId
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if the donor exists in the User collection
    const donorData = await User.findById(userId);
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
        userId,
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

export const donationByIdSummary = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch payments for the user
    const payments = await Payment.find({ userId: id, status: "succeeded" });

    // Calculate total donations
    const totalDonated = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get unique campaigns supported
    const campaignsSupported = await Payment.distinct("campaign", { userId: id, status: "succeeded" });

    // Format the response
    const response = [
      {
        title: "Total Donated",
        value: `$${(totalDonated / 100).toLocaleString()}`, // Convert cents to dollars
      },
      {
        title: "Campaigns Supported",
        value: campaignsSupported.length,
      },
    ];

    res.status(200).json({results: response});
  } catch (error) {
    console.error("Error fetching user summary:", error);
    res.status(500).json({ error: "An error occurred while fetching the user summary." });
  }
};