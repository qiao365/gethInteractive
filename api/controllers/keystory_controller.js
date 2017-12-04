"use strict";

const keystoryModel = require("../models/keystory.model");
const redis = require('../domain/can.prepare').redis;
const net = require("net");
const Config = require("../domain/can.prepare").CONFIG;
var keythereum = require("keythereum");
var datadir = Config.keyStory.basePath;
var ControllerKeyStory = module.exports;

//导入钱包
ControllerKeyStory.importKeyStory = function importKeyStory(req, res) {
    let tsc = req.body;
    keystoryModel.saveKeyStory(tsc).then((data) => {
        res.status(200);
        res.json(data);
    });
};

//导出keystory
ControllerKeyStory.exportKeyStory = function exportKeyStory(req, res){
    let password = req.params.password;
    let address = req.params.address;
    console.log(address);
    keystoryModel.unlockAddress(address,password).then((unlockdata)=>{
        console.log(JSON.stringify(unlockdata));
        if(unlockdata.isSuccess){
            // Asynchronous
            keythereum.importFromFile(address, datadir, function (keyObject) {
                res.status(200);
                res.json({
                    isSuccess:true,
                    keyStory:keyObject
                });
            });
        }else{
            res.status(200);
            res.json({
                isSuccess:false,
                reason : "密码错误"
            });
        }
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
}

module.exports.ControllerKeyStory = ControllerKeyStory;