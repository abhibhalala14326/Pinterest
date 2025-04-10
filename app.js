let createError = require('http-errors');
let express = require('express');
let path = require('path');
let dotenv = require("dotenv")
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let indexRouter = require('./routes/index');
const { default: mongoose } = require('mongoose');
let expreesSession = require("express-session");
const passport = require('passport');
const UserModel = require("./model/UserModel")

// DotEnv
dotenv.config()


// App
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Passport Js
app.use(expreesSession({
  resave:false,
  saveUninitialized:false,
  secret:"pin"
}))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(UserModel.serializeUser())
passport.deserializeUser(UserModel.deserializeUser())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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

// Database Connect

const Dburl = process.env.DB_URL
const DbName = process.env.DB_NAME
mongoose.connect(Dburl , {dbName:DbName}).then(()=>
{
  console.log("Database in connect");
}).catch(()=>
{
  console.log("Database in not connect");
  
})

module.exports = app;
