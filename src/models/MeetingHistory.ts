import mongoose, { Document, Schema } from 'mongoose';

export interface IMeetingHistory extends Document {
  appointmentId: string;
  meetingId: string;
  consultancyId: string;
  clientId: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in minutes
  status: 'active' | 'completed' | 'cancelled';
  participants: {
    consultant: {
      joinedAt?: Date;
      leftAt?: Date;
    };
    client: {
      joinedAt?: Date;
      leftAt?: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const MeetingHistorySchema = new Schema<IMeetingHistory>({
  appointmentId: { type: String, required: true },
  meetingId: { type: String, required: true, unique: true },
  consultancyId: { type: String, required: true },
  clientId: { type: String, required: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  duration: { type: Number },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  participants: {
    consultant: {
      joinedAt: { type: Date },
      leftAt: { type: Date }
    },
    client: {
      joinedAt: { type: Date },
      leftAt: { type: Date }
    }
  }
}, {
  timestamps: true
});

if (mongoose.models.MeetingHistory) {
  delete mongoose.models.MeetingHistory;
}

export default mongoose.model<IMeetingHistory>('MeetingHistory', MeetingHistorySchema);