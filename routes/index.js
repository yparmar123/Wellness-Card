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
          sheetsApi.retrieveDiaryQuestions().then((data) => {
            let overwrite = false;

            if (exists === "exists") {
              overwrite = true;
            }

            res.render("diary", {
              title: "Wellness Card - Add Diary",
              questions: data,
              overwrite: overwrite,
            });
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/SubmitDiary", function (req, res, next) {
  sheetsApi.initialize().then(() => {
    sheetsApi
      .writeDiaryDay(req.body.firstTable, req.body.secondTable)
      .then(() => {
        res.redirect("/");
      });
  });
});

module.exports = router;
