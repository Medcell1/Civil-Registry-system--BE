const express = require("express");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");
const ROLES = require("../utils/roles");
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: ROLES.ADMIN } })
      .select('-password') 
      .populate('district', '_id name'); 

    if (users.length === 0) {
      return res.status(404).json({ message: "No non-admin users found" });
    }

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

module.exports = router;
