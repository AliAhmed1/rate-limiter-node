var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const RateLimiterMiddleware = require("./src/middleware");
const rateLimiterOptions = require("./src/options");

var indexRouter = require("./routes/index");

var app = express();

// view engine setup
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const rateLimiter = new RateLimiterMiddleware(rateLimiterOptions);
app.use("/api", rateLimiter.middleware(), indexRouter);

module.exports = {
    app: app,
    rateLimiter: rateLimiter,
};
