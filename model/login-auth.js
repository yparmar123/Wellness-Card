const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let Schema = mongoose.Schema;

let userSchema = new Schema({
  email: {
    type: String,
    unique: true,
  },
  password: String,
  fName: String,
  lName: String,
  sheetId: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User;

module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db.on("error", (err) => {
      reject(err);
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject("There was an error encrypting the password");
      } else {
        bcrypt.hash(userData.password, salt, (err, hash) => {
          if (err) {
            reject("There was an error encrypting the password");
          } else {
            userData.password = hash;

            let newUser = new User(userData);

            newUser.save((err) => {
              if (err) {
                if (err.code === 11000) {
                  reject("User Name already taken");
                } else {
                  reject("There was an error creating the user: " + err);
                }
              } else {
                resolve();
              }
            });
          }
        });
      }
    });
  });
};

module.exports.checkUsers = (userData) => {
  return new Promise((resolve, reject) => {
    User.find({ email: userData.email })
      .exec()
      .then((users) => {
        if (users.length === 0) {
          reject("Unable to find user: " + userData.email);
        } else {
          bcrypt.compare(userData.password, users[0].password).then((res) => {
            if (res === true) {
              users[0].loginHistory.push({
                dataTime: new Date().toString(),
                userAgent: userData.userAgent,
              });

              User.updateOne(
                { userName: users[0].userName },
                { $set: { loginHistory: users[0].loginHistory } },
                { multi: false }
              )
                .exec()
                .then(() => {
                  resolve(users[0]);
                })
                .catch((err) => {
                  reject("There was an error verifying the user: " + err);
                });
            } else {
              reject("Incorrect Password for user: " + userData.email);
            }
          });
        }
      })
      .catch((err) => {
        reject("unable to find user: " + userData.email);
      });
  });
};
