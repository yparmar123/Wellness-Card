var express = require("express");
var router = express.Router();
const sheetsApi = require("../model/sheets-api");

/* GET home page. */
router.get("/", function (req, res, next) {
  sheetsApi.initialize();
  res.render("index", { title: "Wellness Card - Home Page" });
});

router.get("/AddDiary", function (req, res, next) {
  sheetsApi
    .initialize()
    .then(() => {
      sheetsApi
        .checkDiary()
        .then((exists) => {
          if (exists) {
            res.redirect("/Overwrite");
          } else {
            sheetsApi.retrieveDiaryQuestions().then((data) => {
              console.log(exists);
              res.render("diary", {
                title: "Wellness Card - Add Diary",
                questions: data,
              });
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/Overwrite", function (req, res, next) {
  res.render("overwrite", {
    title: "Wellness Card - Overwrite",
  });
});

module.exports = router;
