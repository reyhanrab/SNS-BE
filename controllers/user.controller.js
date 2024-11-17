import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";

// Create a new user
export const createUser = async (req, res) => {
  try {
    const user = new User(req.body.data);

    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ results: users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get a user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ results: user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

export const getDonationById = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  try {
    // Apply pagination to the donations query
    const donations = await Payment.find({ userId: req.params.id })
      .populate("campaign") // Populate only the fields you need from the campaign
      .skip((page - 1) * limit) // Apply pagination with skip
      .limit(limit); // Limit the number of results per page

    // Get the total number of donations for the user
    const totalItems = await Payment.countDocuments({ userId: req.params.id });

    // Respond with paginated data and metadata
    res.status(200).json({
      results: donations,
      metadata: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", results: user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
