"use strict";

const rf = require("fs"); 
var path = require('path');
const Web3 = require("web3");
const CONFIG = require('../domain/can.prepare').CONFIG;
var rpcWeb3 = new Web3(new Web3.providers.HttpProvider(CONFIG.ethereum.rpc));

let util = module.exports;

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
};

util.guid = function guid(){
    /** it just version 4 guid **/
    function s4(){
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return [s4(), s4(), s4(), s4(), s4(), s4()].join("");
};

util.getDefaltEthAddress = function getDefaltEthAddress(){
    return "0x-eth-contract-address";
};

util.generateTxOfContract = function generateTxOfContract(from, contract, method, amount, receiver){
    let target = receiver.startsWith("0x") ?  receiver.substring(2) : receiver;
    // let gasVal = 90000;
    // let gasValMin = 6000;
    // let gasValMax = 6000000;
    // let gasPrice = 1000000000;
    var preparedTx = {
        from: from,
        to: contract,
        data: [ method, target.padStart(64, '0'), amount.toString(16).padStart(64, '0')].join("")
    };
    // gas:'0x' + gasVal.toString(16),
    // gasPrice:'0x' + gasPrice.toString(16)
    return preparedTx;
};

util.getContractDecimal = function getContractDecimal(contract){
    var tokens = JSON.parse(rf.readFileSync("tokenabi.json","utf-8"));
    var decimal = 1e18;
    tokens.forEach(function(element) {
        if(element.contractAddress.toLowerCase() == contract.toLowerCase()){
            decimal =  element.contractDecimal;
        }
    });
    return decimal;
} 

util.getTransferMethod = function getTransferMethod(contract){
    var tokens = JSON.parse(rf.readFileSync("tokenabi.json","utf-8"));
    var mMethod = "0xa9059cbb";
    tokens.forEach(function(element) {
        if(element.contractAddress.toLowerCase() == contract.toLowerCase()){
            mMethod =  element.contractMethod;
        }
    });
    return mMethod;
} 

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
  
util.getformateDateAndTimeToString  = function getformateDateAndTimeToString()  
{  
    // var time1 = new Date().Format("yyyy-MM-dd");
    var time2 = new Date().Format("yyyy-MM-dd hh:mm:ss");
    return time2;  
};

//线程停留1s  msec = 1000
util.startSleep  = function startSleep(msec){
    var t = Date.now();  
    function sleep(d){  
        while(Date.now - t <= d);  
    }   
    sleep(msec*1000);
};

util.getTokenBalance = function getTokenBalance(contractAddress,address){

    var tokens = JSON.parse(rf.readFileSync("tokenabi.json","utf-8"));
    var tokenBalance = 0;
    tokens.forEach(function(element) {
        if(element.contractAddress.toLowerCase() == contractAddress.toLowerCase()){
            let abi = element.contractAbi;
            var MyContract = rpcWeb3.eth.contract(abi);
            var myContractInstance = MyContract.at(element.contractAddress);
            tokenBalance = myContractInstance.balanceOf(address)/element.contractDecimal;
        }
    });
    return tokenBalance;
};

util.findfile = function findfile(fileName,myfilePath){
    var file = undefined;
    function finder(filePath) {
        let files = rf.readdirSync(filePath);
        files.forEach((name) => {
            let fPath = path.join(filePath,name);
            let stats = rf.statSync(fPath);
            if(stats.isDirectory()) finder(fPath);
            if(stats.isFile()) {
                if(fPath.indexOf(fileName) >= 0){
                    file = fPath;
                }
            }
            
        });
    }
    finder(myfilePath);
    return file;
};