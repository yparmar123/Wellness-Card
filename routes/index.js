var express = require("express");
var router = express.Router();
const sheetsApi = require("../model/sheets-api");

const ensureLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/Login");
  } else if (!req.session.user) {
    res.redirect("/noaccess");
  } else {
    next();
  }
};

/* GET home page. */
router.get("/", ensureLogin, function (req, res, next) {
  sheetsApi.initialize();
  res.render("general/index", { title: "Wellness Card - Home Page" });
});

// Add Diary page
router.get("/AddDiary", ensureLogin, function (req, res, next) {
  sheetsApi
    .initialize()
    .then(() => {
      // First a check is done to see if diary already exists, this allows us
      // to know if an overwrite popup should appear or not
      sheetsApi
        .checkDiary()
        .then((exists) => {
          // Diary questions are retrieved with this call, data is an array of
          // diary questions
          sheetsApi.retrieveDiaryQuestions().then((data) => {
            let overwrite = false;
            // If "exist" value is the string exists, that means a diary exists.
            // Overwrite is set to true, meaning an overwrite modal will pop up when page loads
            if (exists === "exists") {
              overwrite = true;
            }

            // Diary view is rendered, the questions and overwrite value are passed to the front end
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

// This post handles submission of diary entries. It takes in values of the first
// and second table, then passes it over to the writeDiaryDay function. From there it
// is sent over to the sheet assigned to the account owner
router.post("/SubmitDiary", ensureLogin, function (req, res, next) {
  sheetsApi.initialize().then(() => {
    sheetsApi
      .writeDiaryDay(req.body.firstTable, req.body.secondTable)
      .then(() => {
        res.redirect("/");
      });
  });
});

router.get("/Login", function (req, res, next) {
  res.render("account/login", {
    title: "Wellness Card - Log In Page",
  });
});

router.get("/noaccess", (req, res) => {
  res.render("general/noaccess", {
    title: "Error No Access",
  });
});

module.exports = router;
