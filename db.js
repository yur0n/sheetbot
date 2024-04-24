import mongoose from "mongoose";

await mongoose.connect(process.env.DB);

const userSchema = new mongoose.Schema({
	phone: {
    type: String,
    index: true,
    unique: true,
  },
  telegram: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
  },
  username: {
    type: String,
  },
  note: {
    type: String,
  },
});

export const User = mongoose.model("User", userSchema);

const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  user: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export const Message = mongoose.model('Message', messageSchema);