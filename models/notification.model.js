import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Simple email validation regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'campaign', // Reference to Campaign model
    required: true
  },
  notificationType: {
    type: String,
    enum: ['CampaignCreated', 'VolunteerRegistration', 'Reminder'], // Add more types as needed
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now, // Automatically set to current date
    required: true
  },
  status: {
    type: String,
    enum: ['Sent', 'Failed'],
    default: 'Sent',
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
const NotificationLog = mongoose.model('notificationLog', notificationLogSchema);

export default NotificationLog;

