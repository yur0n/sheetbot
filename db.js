import mongoose from "mongoose";

await mongoose.connect("mongodb+srv://yur0n:786512@cluster0.0na8y.mongodb.net/sheetbot");

let userSchema = new mongoose.Schema({
	chat_id: Number,
	phone: String,
});

export default mongoose.model("User", userSchema);