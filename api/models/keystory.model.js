"use strict";

const net = require('net');
var fs = require("fs");
var path = require('path');
const Web3 = require("web3");
var appUtil = require('../models/util.js');
const CONFIG = require("../domain/can.prepare").CONFIG;
var keythereum = require("keythereum");
var datadir = CONFIG.keyStory.basePath+"keystore";
var rpcWeb3 = new Web3(new Web3.providers.HttpProvider(CONFIG.ethereum.rpc));
var KeyStoryModel = module.exports;

KeyStoryModel.saveKeyStory  = function saveKeyStory(body){
    let keystory = body.keystory;
    let password = body.password;
    return new Promise((resolve, reject) => {
        var accounts = rpcWeb3.eth.accounts;
        if(isHaveAddress("0x"+keystory.address,accounts)){
            let file = appUtil.findfile(keystory.address,CONFIG.keyStory.path);
            if(file == undefined){
                return undefined;
            }else{
                resolve ({
                    // filename:filename,
                    keystory:keystory,
                    password:password,
                    path:file
                });
            }
        }else{
            //写入文件
            // let filename = appUtil.getformateDateAndTimeToString()+"-"+keystory.address;
            // let file = path.join(CONFIG.keyStory.path,filename);
            // fs.writeFile(file,JSON.stringify(keystory),{encoding:'utf-8'},function (err) {
            //     if (err){
            //         console.log(err);
            //         reject(err);
            //     }else{
            //         console.log("File Saved !");
            //         resolve ({
            //             filename:filename,
            //             keystory:keystory,
            //             password:password,
            //             path:file
            //         });
            //     }
            // });
            keythereum.exportToFile(keystory,datadir,((file)=>{
                console.log(file);
                resolve ({
                        keystory:keystory,
                        password:password,
                        path:file
                });
            }));
        }
    }).then((data)=>{
        if(data == undefined){
            return {isSuccess: false,
                        reason:"已存在，无法导入"};
        }else{
            return KeyStoryModel.unlockAddress("0x"+data.keystory.address,data.password);
        }
    }).then((unlockdata)=>{
        if(unlockdata.isSuccess){
            console.log("unlock----:success");
            return {
                isSuccess: true
            };
        }else{
            return {
                isSuccess: false,
                reason:unlockdata.reason
            };
        }
    });
};

//解锁账户啊！
KeyStoryModel.unlockAddress = function unlockAddress(account, password) {
    return new Promise((resolve, reject) => {
        function sleep(d){
            for(var t = Date.now();
            Date.now() - t <= d;);
        };
        sleep(3000); //当前方法暂停5秒
     let unlock = rpcWeb3.personal.unlockAccount(account,password,60);
        if(unlock){
            resolve ({
                isSuccess: unlock
            });
        }else{
            let date = {
                isSuccess: false,
                reason:"密码错误"
            };
            resolve (date);
        }
    });

    // return new Promise((resolve, reject) => {
    //     function sleep(d){
    //         for(var t = Date.now();
    //         Date.now() - t <= d;);
    //     };
    //     sleep(5000); //当前方法暂停5秒
    //     let client = net.connect(`${datadir}/geth.ipc`, () => {
    //         client.write(JSON.stringify({ "jsonrpc": "2.0", "method": "personal_unlockAccount", "params": [account,password,3], "id": 1 }));//300s默认的
    //     });
    //     let dataString = '';
    //     client.on('data', (data) => {
    //         dataString += data.toString();
    //         client.end();
    //     });
    //     client.on('end', () => {
    //         let data = JSON.parse(dataString);
    //         console.log(data);
    //         if (data.error) {
    //             fs.unlinkSync(filePath);
    //             reject({
    //                 isSuccess: false,
    //                 reason:"密码错误"
    //             });
    //         } else {
    //             resolve({
    //                 isSuccess: data.result
    //             });
    //         };
    //         client.destroy();
    //     });
    // });
};
    
function isHaveAddress(name,array){
    var ishave = false;
    array.forEach(function(element) {
        if (element == name.toLowerCase()){
            ishave = true; 
        }
    });
    return ishave;
};