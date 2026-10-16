const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

// 1. PLACE ORDER (Protected: Needs Token)
router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { customer, items, total } = req.body;
    const order = new Order({
      customer,
      items,
      total
    });
    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Order failed" });
  }
});

// 2. VIEW ALL ORDERS (To see what has been placed)
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch orders" });
  }
});

module.exports = router;