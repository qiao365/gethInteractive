"use strict";

const express = require("express"),
    bodyParser = require("body-parser");
const ControllerKeyStory = require("./api/controllers/keystory_controller").ControllerKeyStory;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.post('/geth/can/wallect/eth/import/keystory', ControllerKeyStory.importKeyStory);//导入 keystory
app.get('/geth/can/wallect/eth/export/keystory/:password/:address', ControllerKeyStory.exportKeyStory);//导出 keystory

var port = process.env.PORT || 10602;
app.listen(port);
console.log(`listen the port: ${port}`);
module.exports = app;
