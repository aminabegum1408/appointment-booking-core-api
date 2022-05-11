var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BuyerDetailSchema = new Schema({
	name: { type: String, required: true },
	mobileNo: { type: String, required: true },
	email: { type: String, required: true },
    address: { type: String, required: true },
	status: { type: String, required: true },
	user: { type: Schema.ObjectId, ref: "User", required: true },
}, {timestamps: true});

module.exports = mongoose.model("buyer_detail", BuyerDetailSchema);