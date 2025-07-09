import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ReviewSchema = new mongoose.Schema({
  consultancyId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  replies: [ReplySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);