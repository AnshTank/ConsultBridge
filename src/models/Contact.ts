import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    enum: ['user', 'consultancy', 'enterprise'],
    required: true
  },
  inquiryType: {
    type: String,
    enum: ['General Inquiry', 'Partnership', 'Technical Support', 'Business Development', 'Media Inquiry', 'Other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Responded', 'Resolved', 'Closed'],
    default: 'New'
  },
  preferredContactMethod: {
    type: String,
    enum: ['Email', 'Phone', 'Either'],
    default: 'Email'
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

ContactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);