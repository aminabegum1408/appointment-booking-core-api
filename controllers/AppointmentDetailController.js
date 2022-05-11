const AppointmentDetail = require("../models/AppointmentDetailModel");
const AppointmentDetailService = require("../services/AppointmentDetailService");

const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// AppointmentDetail Schema
function AppointmentDetailData(data) {
  this.id = data._id;
  this.title = data.title;
  this.description = data.description;
  this.isbn = data.isbn;
  this.createdAt = data.createdAt;
}

/**
 * AppointmentDetail List.
 *
 * @returns {Object}
 */
exports.appointmentList = [
  auth,
  function (req, res) {
    try {
      AppointmentDetailService.getAllAppointmentDetails(req.user._id).then(
        (appointment) => {
          if (appointment.length > 0) {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              appointment
            );
          } else {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              []
            );
          }
        }
      );
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * AppointmentDetail store.
 *
 * @param {string}      name
 * @param {string}      mobileNo
 * @param {string}      email
 * @param {string}      address
 * @param {string}      startAt
 * @param {string}      endAt
 * @param {string}      sessionDuration
 * @param {string}      description
 * @param {string}	  	slotId
 * @param {string}		  userId
 * @param {string}		  bookingDate
 * @param {string}		 status
 *
 *
 * @returns {Object}
 */
exports.bookAppointmentStore = [
  auth,
  body("startAt", "Start At must not be empty.").isLength({ min: 1 }).trim(),
  body("endAt", "End At must not be empty.").isLength({ min: 1 }).trim(),
  body("sessionDuration", "Session Duration must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("description", "description must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("slotId", "slot ID must not be empty").isLength({ min: 1 }).trim(),
  body("userId", "user ID must not be empty").isLength({ min: 1 }).trim(),
  body("name", "Buyer name must not be empty").isLength({ min: 5 }).trim(),
  body("mobileNo", "Mobile number must not be empty")
    .isLength({ min: 10, max: 10 })
    .trim(),
  body("email", "Buyer email must not be empty").isLength({ min: 5 }).trim(),
  body("address", "Buyer address must not be empty")
    .isLength({ min: 2 })
    .trim(),
  body("bookingDate", "Buyer address must not be empty").trim(),
  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      let bookingDetail = AppointmentDetailService.bookAppointment(req.body);
      return apiResponse.successResponseWithData(
        res,
        "AppointmentDetail add Success.",
        bookingDetail
      );
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * AppointmentDetail update.
 *
 * @param {string}      id
 * @param {string}      slotId
 * @param {string}      startAt
 * @param {string}      bookingDate
 * @param {string}      status
 *
 * @returns {Object}
 */
exports.updateAppointmentRequest = [
  auth,
  // body("_id", "Id must not be empty.").isLength({ min: 1 }).trim(),
  body("slotId", "slotId must not be empty.").trim(),
  body("status", "status must not be empty.").trim(),
  body("startAt", "start At must not be empty").trim(),
  body("bookingDate", "bookingDate must not be empty").trim(),

  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
          );
        } else {
          try {
            AppointmentDetail.find(
              {
                user: req.user._id,
                slot: req.body.slotId,
                bookingDate: new Date(req.body.bookingDate),
                startAt: req.body.startAt,
                status: req.body.status,
              },
              function (err, foundAppointment) {
                if (
                  foundAppointment.length > 0 &&
                  req.body.status === "ACCEPTED"
                ) {
                  console.log("Slot already exist with same start date");
                  return apiResponse.ErrorResponse(
                    res,
                    "Appointment already exists with this slot"
                  );
                } else {
                  AppointmentDetail.findById(
                    req.params.id,
                    function (err, foundAppointment) {
                      if (foundAppointment === null) {
                        return apiResponse.notFoundResponse(
                          res,
                          "AppointmentDetail not exists with this id"
                        );
                      } else {
                        //Check authorized user
                        if (foundAppointment.user.toString() !== req.user._id) {
                          return apiResponse.unauthorizedResponse(
                            res,
                            "You are not authorized to do this operation."
                          );
                        } else {
                          foundAppointment.status = req.body.status;
                          AppointmentDetail.findByIdAndUpdate(
                            req.params.id,
                            foundAppointment,
                            {},
                            function (err) {
                              if (err) {
                                return apiResponse.ErrorResponse(res, err);
                              } else {
                                let bookingData = new AppointmentDetail(
                                  foundAppointment
                                );
                                return apiResponse.successResponseWithData(
                                  res,
                                  "AppointmentDetail update Success.",
                                  bookingData
                                );
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                }
              }
            );
            return updateResponse;
          } catch (error) {
            return console.log(`Could not update Appointment ${error}`);
          }
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
