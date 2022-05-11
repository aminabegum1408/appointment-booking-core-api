var express = require("express");
const SlotDetailController = require("../controllers/SlotDetailController");

var router = express.Router();

router.get("/", SlotDetailController.slotList);
router.post("/", SlotDetailController.createSlot);
router.put("/:id", SlotDetailController.slotUpdate);
router.delete("/:id", SlotDetailController.slotDelete);
router.get("/generate-slot",SlotDetailController.generateSlotPerDay);
module.exports = router;