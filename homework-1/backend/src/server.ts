#!/usr/bin/env node-ts

import cookieParser from "cookie-parser";
import express from "express";
import HTTPErrors from "http-errors";
import log4js from "log4js";
import loggerMiddleware from "morgan";
import config from "./config";
import db from "./db";
import friendsRoutes from "./routes/friends";
import indexRouter from "./routes/index";
import profilesRoutes from "./routes/profiles";
import { errorHandler } from "./util";



log4js.configure({
    appenders: { console: { type: "console" } },
    categories: { default: { appenders: ["console"], level: config.loglevel } }
});

db.init({});

const app = express();

// Setup Middleware
app.use(loggerMiddleware("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(config.public_dir));

// Setup authentication and authorization
// app.use(/\/api.*/, authentication);
// app.use(/\/api.*/, authorizeByRole('user', 'admin'));

// Setup routes
app.use('/', indexRouter);
app.use('/api/profiles', profilesRoutes);
app.use('/api/friends', friendsRoutes);
// app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(HTTPErrors(404, "Resource for that route was not found"));
});

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Example app listening on all interfaces at port: ${config.port}`);
});