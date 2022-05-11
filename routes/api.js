var express = require("express");
var authRouter = require("./auth");
var appointmentRouter = require("./appointmentDetail");
var slotRouter = require("./slot");
var userRouter = require("./user");
var app = express();

app.use("/auth/", authRouter);
app.use("/book-appointment/", appointmentRouter);
app.use("/slot/", slotRouter);
app.use("/users", userRouter);

module.exports = app;
