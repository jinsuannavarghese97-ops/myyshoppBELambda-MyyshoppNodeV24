let personalInformation = require('./personalInformation.js');
let selectAccountDetails = require('./selectAccountDetails.js');
let getBuyerOrder = require('./getBuyerOrder.js');
let wishList = require('./wishList.js');
let feedBack = require('./feedBack.js');
let trackOrder = require('./trackOrder.js');
let reOrderRating = require('./reOrderRating.js');
let reOrder = require('./reOrder.js');
let cmReOrder = require('./cmReOrder.js');
let rtReOrder = require('./rtReOrder.js');
const methods = {};
methods.index = function (client,jsonObj, event, callback) {
    if (event.functionName == 'personalInformation') {
        jsonObj.currentUserId = event.currentUserId;
        personalInformation.personalInformation(client,jsonObj,event, function (response) {
            callback(response)
        });
    }
    if (event.functionName == 'selectAccountDetails') {
        let accountParams = {
            currentUserId: event.currentUserId,
        }
        selectAccountDetails.selectAccountDetails(client,jsonObj,event, accountParams, function (response) {
            callback(response)
        });
    }
    
    
    if (event.functionName == 'getBuyerOrder') {
        jsonObj.currentUserId = event.currentUserId;
        jsonObj.textId = event.textId;
        jsonObj.orderId = event.orderId;
        jsonObj.fromDateQuery = event.fromDateQuery;
        jsonObj.toDateQuery = event.toDateQuery;
        jsonObj.statusQuery = event.statusQuery;
        jsonObj.cmbselect = event.cmbselect;
        jsonObj.txtInputId = event.txtInputId;
        jsonObj.cmbstatus = event.cmbstatus;
        getBuyerOrder.getBuyerOrder(client,jsonObj,event, function (response) {
            console.log('response..getBuyerOrder...',response)
            callback(response);
        });
    }
    
    if (event.functionName == 'wishList') {
        jsonObj.currentUserId = event.currentUserId;
        wishList.wishList(client,jsonObj,event, function (response) {
            console.log("response...",response)
            callback(response);
        });
    }
    
    if (event.functionName == 'feedBack') {
        jsonObj.currentUserId = event.currentUserId;
        feedBack.feedBack(client,jsonObj,event, function (response) {
            callback(response);
        });
    }
    
    if (event.functionName == 'reOrderRating') {
        jsonObj.orderId = event.orderId;
        reOrderRating.reOrderRating(client,jsonObj,event, function (response) {
            callback(response);
        });
    }
    
    if (event.functionName == 'trackOrder') {
        jsonObj.buyerId = event.buyerId;
        trackOrder.trackOrder(client,jsonObj,event, function (response) {
            callback(response);
        });
    }
    if (event.functionName == 'reOrder') {
        jsonObj.orderId = event.orderId;
        reOrder.reOrder(client,jsonObj,event, function (response) {
            callback(response);
        });
    }
    
    if (event.functionName == 'cmReOrder') {
        jsonObj.orderId = event.orderId;
        cmReOrder.cmReOrder(client,jsonObj,event, function (response) {
            callback(response);
        });
    }
    
    if (event.functionName == 'rtReOrder') {
        jsonObj.orderId = event.orderId;
        rtReOrder.rtReOrder(client,jsonObj,event, function (response) {
            callback(response);
        });
    }
    
}
module.exports = methods;
