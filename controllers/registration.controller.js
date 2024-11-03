import Registration from "../models/registration.model.js";

// Get all registrations
export const getRegistrations = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Remove pagination parameters from query to use remaining ones as filters
  const filters = { ...req.query };
  delete filters.page;
  delete filters.limit;

  // Set default filter for isActive if not specified in the query
  if (filters.isActive === undefined) {
    filters.isActive = true;
  }

  try {
    // Apply dynamic filters to the database query and populate campaign details
    const registrations = await Registration.find(filters)
      .populate("campaign") // Populate the campaign field with campaign information
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Registration.countDocuments(filters);

    res.status(200).json({
      results: registrations,
      metadata: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations", error });
  }
};

export const checkin = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the registration exists for the given campaign
    const registrationExists = await Registration.findOne({
      _id: id,
    });
    if (!registrationExists) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Proceed to update the registration status to "checked-in"
    const updatedRegistration = await Registration.findOneAndUpdate(
      { _id: id },
      { status: "checked-in", checkInDate: new Date() },
      { new: true }
    );

    res.status(200).json({
      message: "Volunteer checked in successfully",
      registration: updatedRegistration,
    });
  } catch (error) {
    res.status(500).json({ message: "Error during check-in", error });
  }
};

export const checkout = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the registration exists for the given campaign
    const registrationExists = await Registration.findOne({
      _id: id,
    });
    if (!registrationExists) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Proceed to update the registration status to "checked-out"
    const updatedRegistration = await Registration.findOneAndUpdate(
      { _id: id },
      { status: "checked-out", checkOutDate: new Date() },
      { new: true }
    );

    res.status(200).json({
      message: "Volunteer checked out successfully",
      registration: updatedRegistration,
    });
  } catch (error) {
    res.status(500).json({ message: "Error during check-out", error });
  }
};
