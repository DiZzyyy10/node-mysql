const express = require('express');
const router = express.Router();
const passport = require("passport");

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  res.render("signin", {
    title: res.__('auth.signin_title'),
    isAuth: isAuth,
    errorMessage: [], // Initialize empty error array
    currentLang: req.getLocale()
  });
});

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      console.error('Authentication error:', err);
      return res.render("signin", {
        title: res.__('auth.signin_title'),
        isAuth: false,
        errorMessage: [res.__('auth.login_general_error')],
        currentLang: req.getLocale()
      });
    }
    
    if (!user) {
      // Authentication failed - map error messages to translations
      let errorMsg;
      if (info && info.message) {
        if (info.message.includes('Username not found') || info.message.includes('ユーザー名が見つかりません')) {
          errorMsg = res.__('auth.username_not_found');
        } else if (info.message.includes('Incorrect password') || info.message.includes('パスワードが間違っています')) {
          errorMsg = res.__('auth.incorrect_password');
        } else if (info.message.includes('system error') || info.message.includes('システムエラー')) {
          errorMsg = res.__('auth.login_system_error');
        } else {
          errorMsg = res.__('auth.login_general_error');
        }
      } else {
        errorMsg = res.__('auth.login_general_error');
      }
      
      return res.render("signin", {
        title: res.__('auth.signin_title'),
        isAuth: false,
        errorMessage: [errorMsg],
        currentLang: req.getLocale()
      });
    }
    
    // Authentication succeeded
    req.logIn(user, function(err) {
      if (err) {
        console.error('Login error:', err);
        return res.render("signin", {
          title: res.__('auth.signin_title'),
          isAuth: false,
          errorMessage: [res.__('auth.login_failed')],
          currentLang: req.getLocale()
        });
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

module.exports = router;
