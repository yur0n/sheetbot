import mongoose from "mongoose";

await mongoose.connect(process.env.DB);

let userSchema = new mongoose.Schema({
	chat_id: Number,
	phone: String,
});

export default mongoose.model("User", userSchema);