var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require("./funcs/logger");
var morganLogger = require("morgan");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testAPIRouter = require("./routes/testAPI");
var ovDoorRouter = require("./routes/ovDoor");
var restartRouter = require("./routes/restart");
var ipRouter = require("./routes/ip");
var logsRouter = require("./routes/logs");
var uploadRouter = require("./routes/upload");
var orderRouter = require("./routes/order");
var pushKeyRouter = require("./routes/pushKey");
var pushSubRouter = require("./routes/pushSub");
const { execSync } = require('child_process');
const updateUserTime = require("./funcs/updateUsertime");

const fs = require('fs');
setInterval(updateUserTime, 60 * 1000);

  


var app = express();
var cors = require("cors");
// view engine setup

app.use(cors());
app.use(morganLogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'),{
  extensions: ['html']
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/testAPI", testAPIRouter);
app.use("/ovDoor", ovDoorRouter);
app.use("/restart", restartRouter);
app.use("/ip", ipRouter);
app.use("/logs", logsRouter);
app.use("/upload", uploadRouter);
app.use("/order", orderRouter);
app.use("/pushKey", pushKeyRouter);
app.use("/pushSub", pushSubRouter);


try {
  const stdout = execSync('./setup.sh');
  logger.info(`Git pull stdout: ${stdout}`);
} catch (error) {
  logger.error(`Error pulling code from Git: ${error}`);
  return;
}

app.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  logger.error(`Uncaught Exception: ${err.message}`);
  // process.exit(1) // Normally, you should let your app crash and let something like PM2 or forever.js restart it
});

app.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  // process.exit(1) // Normally, you should let your app crash and let something like PM2 or forever.js restart it
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let filePath = path.join(__dirname, 'public', req.path);

  // If the path does not already end with '.html', append '.html' to it
  if (!filePath.endsWith('.html')) {
      filePath += '.html';
  }

  // If the file exists, send it
  if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
  } else {
      // If the file does not exist, send the 404 page
      res.status(404).sendFile(path.join(__dirname, '/public/404.html'));
  }
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
console.log("App.js is running")

module.exports = app;
