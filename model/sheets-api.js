const { google } = require("googleapis");

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const client = new google.auth.JWT(
  process.env.client_email,
  null,
  process.env.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

class SheetsService {
  constructor() {}
  initialize = async () => {
    return client.authorize((err, tokens) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Connection Successful!");
      }
    });
  };

  // This function checks if a diary entry
  // already exists for the current day
  checkDiary = async () => {
    // Creates api variable
    const gsapi = google.sheets({ version: "v4", auth: client });

    // Return value of function
    let exists = "";

    // These options are the ones used to check if a diary card exists for the current day.
    // We fill up the data using date information gathered from the previous code.
    const opt = {
      spreadsheetId: process.env.sheet_id,
      range: this.generateSheetRange(),
    };

    gsapi.spreadsheets.create();

    // Basically if no sheet for that week exists, or no data is filled up for that day in the sheet,
    // exists remains false. In the case that there are values in the correct sheet, exists becomes
    // true
    try {
      let data = await gsapi.spreadsheets.values.get(opt);
      if (data.data.values) {
        exists = "exists";
      } else {
        exists = "page";
      }
    } catch (err) {
      exists = "no page";
    }

    // Exists is returned
    return exists;
  };

  // This function was created to test retrieving
  // diary and is not currently implemented into
  // the project as a feature
  getDiary = async () => {
    const gsapi = google.sheets({ version: "v4", auth: client });
    const opt = {
      spreadsheetId: process.env.sheet_id,
      range: "Jan. 18 - Jan. 24, 2022!C1:D1",
    };

    gsapi.spreadsheets.create();
    let data = await gsapi.spreadsheets.values.get(opt);
    console.log(data.data.values);
  };

  // This function takes in values for both the table and
  // writes them into the correct day and correct row
  writeDiaryDay = async (firstTable, secondTable) => {
    const gsapi = google.sheets({ version: "v4", auth: client });

    // These options are for a batch update, includes the values for both
    // table ranges and table values
    const opt = {
      spreadsheetId: process.env.sheet_id,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: [
          // These are the values for the first table
          {
            range: this.generateSheetRange(),
            values: [firstTable],
          },
          // These are the values for the second table
          {
            range: this.generateSheetRange(false),
            values: [secondTable],
          },
        ],
      },
    };

    // This section starts off by checking the status on
    // whether a page exists, entry exists or entry does not exist
    this.checkDiary()
      .then((exists) => {
        // If a page doesnt exist a new page will be created,
        // function called takes care of creation and writing
        // of entry (possibly look into this in the future as
        // writing after createNewSheet led to an error, it would
        // be preferrable to write in the current function instead)
        if (exists === "no page") {
          this.createNewSheet(opt);
          // If a page does exist the values will be written right away
        } else {
          gsapi.spreadsheets.values.batchUpdate(opt);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // This function retrieves diary questions
  // from the user's sheets settings page
  retrieveDiaryQuestions = async () => {
    // initiates connection with sheets
    const gsapi = google.sheets({ version: "v4", auth: client });
    gsapi.spreadsheets.create();

    // retrieves number of elements per table
    const opt = {
      spreadsheetId: process.env.sheet_id,
      range: "Settings!A3:A4",
    };
    let tableData = await gsapi.spreadsheets.values.get(opt);

    // retrieves first table questions
    opt.range = `Settings!B3:B${tableData.data.values[0][0] + 2}`;
    let tableQuestions = await gsapi.spreadsheets.values.get(opt);

    // retrieves second table questions
    opt.range = `Settings!C3:C${tableData.data.values[1][0] + 2}`;
    let secondTableQuestsions = await gsapi.spreadsheets.values.get(opt);

    // variable stores both table's questions in an object
    let questions = {
      firstTable: tableQuestions.data.values.map((el) => el[0]),
      secondTable: secondTableQuestsions.data.values.map((el) => el[0]),
    };

    return questions;
  };

  // This function creates a new page and copies the layout from the layout page
  // in the spreadsheet
  createNewSheet = async (options) => {
    // initiates connection with sheets
    const gsapi = google.sheets({ version: "v4", auth: client });

    // this section copies the layout for the new sheet being created
    const opt = {
      spreadsheetId: process.env.sheet_id,
      range: "Layout!A1:W19",
    };
    let tableData = await gsapi.spreadsheets.values.get(opt);

    let layout = tableData.data.values;

    // Title is generated for the new sheet being created.
    // This is made by generating the whole range of a sheet while substringing from "!"
    let sheetTitle = this.generateSheetRange();
    sheetTitle = sheetTitle.substring(0, sheetTitle.indexOf("!"));

    // Request properties are set here
    const requests = [
      {
        addSheet: {
          properties: {
            title: sheetTitle,
          },
        },
      },
    ];

    // This function is used to add a new sheet
    await gsapi.spreadsheets.batchUpdate(
      {
        spreadsheetId: process.env.sheet_id,
        resource: { requests },
      },
      (err, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        } else {
          // If new sheet is created, the text is copied from the layout data to the new sheet.
          // Options are updated to update the new sheet.
          opt.range = sheetTitle + "!A1:W19";
          opt.resource = { values: layout };
          opt.valueInputOption = "USER_ENTERED";

          // Updates table with layout values
          gsapi.spreadsheets.values
            .update(opt)
            .then(() => {
              // Updates table with diary entry values
              gsapi.spreadsheets.values.batchUpdate(options);
            })
            .catch((err) => console.log(err));
        }
        return res;
      }
    );
  };

  // This function generates a string which represents the range of today's
  // date in terms of which cells to edit and which sheet to be on.

  generateSheetRange = (firstTable = true) => {
    // Variable saves current date
    const currentDate = new Date();

    // Since the diary card we are working with starts on Tuesdays,
    // this line of code checks if the day is before Tuesday. If so
    // the current day will have 7 added to it to make the day work
    // with our sheets layout.
    let currentDay =
      currentDate.getDay() < 2
        ? currentDate.getDay() + 7
        : currentDate.getDay();

    // Subtracting 2 allows for us to view the week from 1-7 but with Tuesday as the first day
    currentDay -= 2;

    // Sets the first date of the week to the Tuesday of the week
    let firstDate = new Date();
    firstDate.setDate(firstDate.getDate() - currentDay);

    // Sets the last date of the week to the Monday of the week
    let lastDate = new Date();
    lastDate.setDate(firstDate.getDate() + 6);

    let range = "";

    // firstTable variable has been entered to allow program to know
    // to generate range for the first or second table. This if statement
    // is where that decision is made.
    if (firstTable) {
      range = `${months[firstDate.getMonth()]}. ${firstDate.getDate()} - ${
        months[lastDate.getMonth()]
      }. ${lastDate.getDate()}, ${lastDate.getFullYear()}!B${currentDay + 3}:W${
        currentDay + 3
      }`;
    } else {
      range = `${months[firstDate.getMonth()]}. ${firstDate.getDate()} - ${
        months[lastDate.getMonth()]
      }. ${lastDate.getDate()}, ${lastDate.getFullYear()}!B${
        currentDay + 12
      }:W${currentDay + 12}`;
    }

    return range;
  };
}

sheetsService = new SheetsService();

module.exports = sheetsService;
