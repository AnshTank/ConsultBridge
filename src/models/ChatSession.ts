import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    booking: mongoose.Schema.Types.Mixed,
    consultancies: [mongoose.Schema.Types.Mixed],
    paymentReceipt: mongoose.Schema.Types.Mixed,
    requiresAuth: Boolean,
    authMessage: String,
    categoryNavigation: mongoose.Schema.Types.Mixed,
    allCategories: mongoose.Schema.Types.Mixed
  }
});

const ConversationMemorySchema = new mongoose.Schema({
  userProblem: String,
  problemCategory: String,
  emotionalState: {
    type: String,
    default: 'neutral'
  },
  topicsDiscussed: [String],
  lastProblemMention: Number,
  hasSharedProblem: {
    type: Boolean,
    default: false
  },
  recentContext: [mongoose.Schema.Types.Mixed],
  communicationStyle: {
    type: String,
    default: 'neutral'
  },
  conversationFlow: {
    type: String,
    default: 'greeting'
  }
});

const BookingStateSchema = new mongoose.Schema({
  selectedConsultancy: mongoose.Schema.Types.Mixed,
  step: {
    type: Number,
    default: 0
  },
  tempData: mongoose.Schema.Types.Mixed
});

const AppointmentActionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['reschedule', 'cancel', ''],
    default: ''
  },
  step: {
    type: Number,
    default: 0
  },
  selectedAppointment: mongoose.Schema.Types.Mixed
});

const ChatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  chatHistory: [MessageSchema],
  conversationMemory: ConversationMemorySchema,
  bookingState: BookingStateSchema,
  appointmentAction: AppointmentActionSchema,
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastActivity on save
ChatSessionSchema.pre('save', function() {
  this.lastActivity = new Date();
});

// Auto-expire inactive sessions after 7 days
ChatSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);