// routes/billRoutes.js

const express = require("express");
const router = express.Router();
const {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  getBillsByDateRange,
} = require("../controllers/billController");

// Create a new bill
router.post("/add-bill", createBill);

// Get all bills
router.get("/get-bills", getAllBills);

// Get a single bill by ID
router.get("/get-bills/:id", getBillById);

// Update a bill
router.patch("/update-bills/:id", updateBill);
// Delete a bill
router.delete("/delete-bills/:id", deleteBill);

// Get bills by date range
router.get("/get-bills/date-range", getBillsByDateRange);

module.exports = router;
