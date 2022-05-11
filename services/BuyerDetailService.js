const BuyerDetail = require("../models/BuyerDetailModel");

module.exports = class BuyerDetailService{
    static async createBuyerDetail(data){
        try {
            const newBuyer ={
                name: data.name,
                mobileNo : data.mobileNo,
                email : data.email,
                address: data.address,
                status : "true"
            }
           const response = await new BuyerDetail(newBuyer).save();
           return response._id;
        } catch (error) {
            console.log(error);
        } 
    }
}