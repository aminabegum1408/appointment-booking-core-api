const SlotDetail = require("../models/SlotDetailModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
var eachHourOfInterval = require("date-fns");
const moment = require("moment");
const AppointmentDetailModel = require("../models/AppointmentDetailModel");

mongoose.set("useFindAndModify", false);

// Slot Schema
function SlotData(data) {
  this.id = data._id;
  this.name = data.name;
  this.description = data.description;
  this.start_date = data.start_date;
  this.end_date = data.end_date;
  this.start_time = data.start_time;
  this.end_time = data.end_time;
  this.sessionDuration = data.sessionDuration;
  this.createdAt = data.createdAt;
}

/**
 * Slot List.
 *
 * @returns {Object}
 */
exports.slotList = [
  auth,
  function (req, res) {
    try {
      SlotDetail.find(
        { user: req.user._id },
        "_id name description start_time end_time start_date end_date createdAt user sessionDuration "
      ).then((slot) => {
        if (slot.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            slot
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

/**
 * create Slot.
 *
 * @param {string}      name
 * @param {string}      description
 * @param {Date}        start_date
 * @param {Date}        end_date
 * @param {string}      start_time
 * @param {string}      end_time
 * @param {string}      sessionDuration
 * @returns {Object}
 */
exports.createSlot = [
  auth,
  body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
  body("description", "Description must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("end_date", "end_date must not be empty").isLength({ min: 1 }).trim(),
  body("start_time", "start_time must not be empty")
    .isLength({ min: 1 })
    .trim(),
  body("end_time", "end_time must not be empty").isLength({ min: 1 }).trim(),
  body("start_date", "start_date must not be empty")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return SlotDetail.find({
        user: req.user._id,
        start_date: { $gte: new Date(value).toISOString() },
        end_date: { $lte: new Date(req.body.end_date).toISOString() },
      }).then((slot) => {
        if (slot.length > 0) {
          return Promise.reject("Slot already exist with same start date");
        }
      });
    }),
  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      var slot = new SlotDetail({
        name: req.body.name,
        user: req.user,
        description: req.body.description,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        sessionDuration: req.body.sessionDuration,
      });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        //Save slot.
        slot.save(function (err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          let slotData = new SlotData(slot);
          return apiResponse.successResponseWithData(
            res,
            "Slot add Success.",
            slotData
          );
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Slot update.
 * @param {string}      name
 * @param {string}      description
 * @param {Date}        start_date
 * @param {Date}        end_date
 * @param {string}      start_time
 * @param {string}      end_time
 * @returns {Object}
 */
exports.slotUpdate = [
  auth,
  body("name"),
  body("description"),
  body("end_date"),
  body("start_time"),
  body("end_time"),
  body("start_date").custom((value, { req }) => {
    return SlotDetail.findOne({
      start_date: value,
      user: req.user._id,
      _id: { $ne: req.params.id },
    }).then((slot) => {
      if (slot) {
        return Promise.reject("SlotDetail already exist with same time.");
      }
    });
  }),
  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      var slot = new SlotDetail({
        name: req.body.name,
        user: req.user,
        description: req.body.description,
        start_date: new Date(req.body.start_date).toISOString(),
        end_date: new Date(req.body.end_date).toISOString(),
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        _id: req.params.id,
      });
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
          SlotDetail.findById(req.params.id, function (err, foundSlot) {
            if (foundSlot === null) {
              return apiResponse.notFoundResponse(
                res,
                "Slot not exists with this id"
              );
            } else {
              //Check authorized user
              if (foundSlot.user.toString() !== req.user._id) {
                return apiResponse.unauthorizedResponse(
                  res,
                  "You are not authorized to do this operation."
                );
              } else {
                //update slot.
                SlotDetail.findByIdAndUpdate(
                  req.params.id,
                  slot,
                  {},
                  function (err) {
                    if (err) {
                      return apiResponse.ErrorResponse(res, err);
                    } else {
                      let slotData = new SlotData(slot);
                      return apiResponse.successResponseWithData(
                        res,
                        "Slot update Success.",
                        slotData
                      );
                    }
                  }
                );
              }
            }
          });
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Slot Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.slotDelete = [
  auth,
  function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.validationErrorWithData(
        res,
        "Invalid Error.",
        "Invalid ID"
      );
    }
    try {
      SlotDetail.findById(req.params.id, function (err, foundSlot) {
        if (foundSlot === null) {
          return apiResponse.notFoundResponse(
            res,
            "SlotDetail not exists with this id"
          );
        } else {
          //Check authorized user
          if (foundSlot.user.toString() !== req.user._id) {
            return apiResponse.unauthorizedResponse(
              res,
              "You are not authorized to do this operation."
            );
          } else {
            //delete slot.
            SlotDetail.findByIdAndRemove(req.params.id, function (err) {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponse(res, "Slot delete Success.");
              }
            });
          }
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Generate Slots per day .
 * @param {string}      userId
 * @param {Date}        selectedDate
 * @returns {Object}
 */
exports.generateSlotPerDay = [
  auth,
  function (req, res) {
    try {
      let date = req.query.selectedDate;
      SlotDetail.find(
        {
          user: req.query.userId,
          start_date: { $lte: new Date(date).toISOString() },
          end_date: { $gte: new Date(req.query.selectedDate).toISOString() },
        },
        "_id name description sessionDuration start_time end_time start_date end_date createdAt user"
      ).then((slot) => {
        if (slot.length > 0) {
          var slots = createSlotOfSelectedDate(
            slot[0]._id,
            slot[0].start_time,
            slot[0].end_time,
            slot[0].sessionDuration,
            date
          );
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            slots
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

function createSlotOfSelectedDate(
  slotId,
  start,
  end,
  sessionDuration,
  selectedDate
) {
  let x = {
    slotInterval: sessionDuration ? sessionDuration : "60",
    openTime: start,
    closeTime: end,
  };

  let startTime = moment(x.openTime, "HH:mm:ss a");
  let endTime = moment(x.closeTime, "HH:mm:ss a").add(1, "days");

  let allSolt = [];
  while (startTime < endTime) {
    var status = true;
    let slot = {
      startAt: startTime.format("HH:mm a"),
      date: new Date(selectedDate),
      slotId: slotId,
      sessionDuration: x.slotInterval,
    };

    AppointmentDetailModel.find({
      startAt: slot.startAt,
      // bookingDate: new Date(slot.date).toISOString(),
      slot: slotId,
      status: "ACCEPTED",
    }).then((foundAppointment) => {
      if (foundAppointment.length > 0) {
        console.log("*****" + foundAppointment);
        status = false;
      } else {
        status = true;
      }
    });

    let endAt = startTime.add(x.slotInterval, "minutes");
    slot.endAt = endAt.format("HH:mm a");
    slot.available = status;
    allSolt.push(slot);
  }
  // console.log(allSolt);
  return allSolt;
}
