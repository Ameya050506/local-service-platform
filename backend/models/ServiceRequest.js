import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  service: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  desc: { type: String },
  provider: { type: String, default: null },
  status: { type: String, default: 'Pending' },
  statusColor: { type: String, default: 'bg-yellow-100 text-yellow-800' },
  customerEmail: { type: String, default: null }
}, { 
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' timestamps!
});

// MongoDB automatically creates an ID field called '_id'. 
// This little trick cleans it up to just 'id' so our React frontend can read it easily.
requestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

export default mongoose.model('ServiceRequest', requestSchema);