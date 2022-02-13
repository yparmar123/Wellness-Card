var express = require("express");
var router = express.Router();
const sheetsApi = require("../model/sheets-api");

/* GET home page. */
router.get("/", function (req, res, next) {
  sheetsApi.initialize();
  res.render("index", { title: "DBT Diary Card" });
});

router.get("/diary", function (req, res, next) {
  res.render("diary", { title: "Diary" });
});

module.exports = router;
