const passport = require("passport");
const LocalStrategy = require("passport-local");
const knex = require("../db/knex");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const cookieSession = require("cookie-session");
const secret = "secretCuisine123";

module.exports = function (app) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  passport.use(new LocalStrategy({
      usernameField: "username",
      passwordField: "password",
    }, function (username, password, done) {
      knex("users")
        .where({
          name: username,
        })
        .select("*")
        .then(async function (results) {
          if (results.length === 0) {
            return done(null, false, {message: "Username not found. Please check your username or sign up for a new account."});
          } else if (await bcrypt.compare(password, results[0].password)) {
            return done(null, results[0]);
          } else {
            return done(null, false, {message: "Incorrect password. Please try again."});
          }
        })
        .catch(function (err) {
          console.error('Database error during authentication:', err);
          return done(null, false, {message: "Login failed due to a system error. Please try again later."})
        });
    }
  ));

  app.use(
    cookieSession({
      name: "session",
      keys: [secret],

      // Cookie Options
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
  );

  app.use(passport.session());
};
