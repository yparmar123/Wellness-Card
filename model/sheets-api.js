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

module.exports.initialize = () => {
  return client.authorize((err, tokens) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connection Successful!");
      this.checkDiaryDate(client);
    }
  });
};

module.exports.checkDiary = async (cl) => {
  const gsapi = google.sheets({ version: "v4", auth: cl });
  const currentDate = new Date();
  let currentDay =
    currentDate.getDay() < 2 ? currentDate.getDay() + 6 : currentDate.getDay();

  let firstDayDifference = currentDay - 2;

  let firstDate = new Date();
  firstDate.setDate(firstDate.getDate() - firstDayDifference);
  let lastDate = new Date();
  lastDate.setDate(firstDate.getDate() + 6);

  const opt = {
    spreadsheetId: "1u9R6fHRkt2NxIsbScEvWYcbozIi6pjuhiHmiCQ9dtXQ",
    range: `${months[firstDate.getMonth()]}. ${firstDate.getDate()} - ${
      months[lastDate.getMonth()]
    }. ${lastDate.getDate()}, ${lastDate.getFullYear()}!B${currentDay + 1}:W${
      currentDay + 1
    }`,
  };

  gsapi.spreadsheets.create();
  try {
    let data = await gsapi.spreadsheets.values.get(opt);
    if (data.data.values) {
      console.log("diary does exist");
    } else {
      console.log("diary does not exist");
    }
  } catch (err) {
    console.log("diary does not exist");
  }
};

module.exports.getDiary = async (cl) => {
  const gsapi = google.sheets({ version: "v4", auth: cl });
  const opt = {
    spreadsheetId: "1u9R6fHRkt2NxIsbScEvWYcbozIi6pjuhiHmiCQ9dtXQ",
    range: "Jan. 18 - Jan. 24, 2022!C1:D1",
  };

  gsapi.spreadsheets.create();
  let data = await gsapi.spreadsheets.values.get(opt);
  console.log(data.data.values);
};

module.exports.writeDiaryDay = async (cl) => {
  const gsapi = google.sheets({ version: "v4", auth: cl });
  const opt2 = {
    spreadsheetId: "1u9R6fHRkt2NxIsbScEvWYcbozIi6pjuhiHmiCQ9dtXQ",
    range: "Jan. 18 - Jan. 24, 2022!C3:W3",
    valueInputOption: "USER_ENTERED",
    resource: { values: [["1", "2", "3"]] },
  };

  let res = await gsapi.spreadsheets.values.update(opt2);
  console.log(res);
};
