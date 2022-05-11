const AppointmentDetail = require("../models/AppointmentDetailModel");
const BuyerDetailModel = require("../models/BuyerDetailModel");
const BuyerDetailService = require("./BuyerDetailService");

module.exports = class AppointmentDetailService {
  static async bookAppointment(data) {
    try {
      const newBuyer = {
        name: data.name,
        mobileNo: data.mobileNo,
        email: data.email,
        address: data.address,
        status: "true",
        user: data.userId,
      };
      const response1 = await new BuyerDetailModel(newBuyer).save();
      //   if(foundAppointment )
      const newAppointment = {
        startAt: data.startAt,
        endAt: data.endAt,
        sessionDuration: data.sessionDuration,
        description: data.description,
        user: data.userId,
        buyer: response1._id,
        slot: data.slotId,
        status: data.status,
        bookingDate: data.bookingDate,
      };
      const response = await new AppointmentDetail(newAppointment).save();
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  static async getAllAppointmentDetails(userId) {
    try {
      const allAppointment = await AppointmentDetail.find({
        user: userId,
      }).populate("buyer", " name mobileNo email");
      return allAppointment;
    } catch (error) {
      console.log(`Could not fetch Appointment ${error}`);
    }
  }
  static async updateAppointmentRequest(id, user, params, res) {
    console.log(id, user, params +"==============");
    
  }
};
