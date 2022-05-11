var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
	startAt: {type: String, required: true},
	endAt: {type: String, required: true},
	sessionDuration: {type: String, required: true},
	description: {type: String, required: false},
	bookingDate: {type: Date, required: false},
	status: { type: String, required: true },
	user: { type: Schema.ObjectId, ref: "user", required: true },
	slot: { type: Schema.ObjectId, ref: "slot_detail", required: true },
	buyer: { type: Schema.ObjectId, ref: "buyer_detail", required: true },

}, {timestamps: true});

module.exports = mongoose.model("appointment_detail", AppointmentSchema);