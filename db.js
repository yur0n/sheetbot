import mongoose from "mongoose";

await mongoose.connect(process.env.DB);

let userSchema = new mongoose.Schema({
	_id: String,
	phone: String,
});

export default mongoose.model("User", userSchema);