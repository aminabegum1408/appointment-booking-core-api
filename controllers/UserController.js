const User = require("../models/UserModel");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

/**
 * User List with search option.
 *
 * @returns {Object}
 */
exports.userList = [
  auth,
  function (req, res) {
    try {
      var query = { role: "1" };
      var name = req.query.name.toLowerCase();
      if (name != 0) query = { firstName: { $regex: ".*" + name + ".*" },role: "1" };
      User.find(
        query,
        "_id firstName lastName email mobile_no address zipcode city createdAt"
      ).then((user) => {
        if (user.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            user
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
