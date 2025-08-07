const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const i18n = require('./config/i18n');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// i18n middleware
app.use(i18n.init);

// Language middleware
app.use((req, res, next) => {
  // Check for language in query params, cookies, or use default
  const lang = req.query.lang || req.cookies.language || 'en';
  
  // Validate language
  if (['en', 'ja'].includes(lang)) {
    i18n.setLocale(req, lang);
    res.cookie('language', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
  }
  
  // Make translation function available in templates
  res.locals.__ = res.__;
  res.locals.currentLang = i18n.getLocale(req);
  
  next();
});

// authorization
require("./config/passport")(app);

// router
app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
