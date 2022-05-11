var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SlotDetailSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    sessionDuration: {type: String, required: true},
    user: { type: Schema.ObjectId, ref: "User", required: true },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("slot_detail", SlotDetailSchema);
