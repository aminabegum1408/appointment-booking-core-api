var express = require("express");
const AppointmentController = require("../controllers/AppointmentDetailController");

var router = express.Router();

router.get("/", AppointmentController.appointmentList);
router.post("/", AppointmentController.bookAppointmentStore);
router.put("/:id", AppointmentController.updateAppointmentRequest);

module.exports = router;