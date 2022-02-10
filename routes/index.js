var express = require("express");
var router = express.Router();
const sheetsApi = require("../model/sheets-api");

/* GET home page. */
router.get("/", function (req, res, next) {
  sheetsApi.initialize();
  res.render("index", { title: "Express" });
});

module.exports = router;
