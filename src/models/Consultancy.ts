import mongoose, { Document, Schema } from 'mongoose';

export interface IConsultancy extends Document {
  name: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
  location: string;
  expertise: string[];
  price: string;
  whyChooseUs?: string[];
  availability: {
    days: string[];
    hours: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    password: string;
  };
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    emailCode?: string;
    phoneCode?: string;
    emailCodeExpiry?: Date;
    phoneCodeExpiry?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConsultancySchema = new Schema<IConsultancy>({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  reviews: { type: Number, required: true, default: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  expertise: [{ type: String, required: true }],
  price: { type: String, required: true },
  whyChooseUs: [{ type: String }],
  availability: {
    days: [{ type: String, required: true }],
    hours: { type: String, required: true }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: true },
    password: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  rejectionReason: { type: String },
  verification: {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    emailCode: { type: String },
    phoneCode: { type: String },
    emailCodeExpiry: { type: Date },
    phoneCodeExpiry: { type: Date }
  }
}, {
  timestamps: true
});

// Clear any existing model to avoid schema conflicts
if (mongoose.models.Consultancy) {
  delete mongoose.models.Consultancy;
}

export default mongoose.model<IConsultancy>('Consultancy', ConsultancySchema);