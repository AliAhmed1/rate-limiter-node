var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("<p>Welcome to the rate-limited API!</p>");
});

/* GET rate-limited API route */
router.get("/api", function (req, res, next) {
  res.json({ message: "Welcome to the rate-limited API!" });
});

module.exports = router;
