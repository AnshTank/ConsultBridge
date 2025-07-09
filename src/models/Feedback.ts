import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userType: {
    type: String,
    enum: ['user', 'consultancy'],
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['General', 'UI/UX', 'Bug Report', 'Feature Request', 'Service Quality', 'Platform Performance'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  feedback: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

FeedbackSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);