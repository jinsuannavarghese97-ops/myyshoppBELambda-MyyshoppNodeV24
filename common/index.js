let getStoreData = require('./getStoreData.js');
let getLocationAndCategoryData = require('./getLocationAndCategoryData.js');
let getEasypayDetails = require('./getEasypayDetails.js');
let getStoreDataWithStoreId = require('./getStoreDataWithStoreId.js');
let addState = require('./addState.js');
let feedBack = require('./feedBack.js');
let sellerEnquiry = require('./sellerEnquiry.js');
let updatefeedback = require('./updatefeedback.js');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function(client,jsonObj,event,callback) {
    if (event.functionName == 'getStoreData') {
      //  jsonObj.storeItemStockId = event.storeItemStockId;
        getStoreData.getStoreData(client,event, function (response) {
            callback( response)
        });
    }
    else if (event.functionName == 'getLocationAndCategoryData') {
        getLocationAndCategoryData.getLocationAndCategoryData(client,event, function (response) {
            callback( response)
        });
    }
    else if (event.functionName == 'getEasypayDetails') {
        getEasypayDetails.getEasypayDetails(client,event, function (response) {
            callback( response)
        });
    }
    else if (event.functionName == 'getStoreDataWithStoreId') {
        getStoreDataWithStoreId.getStoreDataWithStoreId(client,event, function (response) {
            callback( response)
        });
    }
    else if (event.functionName == 'addState') {
        addState.addState(client,event, function (response) {
            callback( response)
        });
    }
    else if (event.functionName == 'feedBack') {
        feedBack.feedBack(client,event, function (response) {
            callback( response)
        });
    }
    else if (event.functionName == 'sellerEnquiry') {
        sellerEnquiry.sellerEnquiry(client,event, function (response) {
            callback( response)
        });
    }
    else if (event.functionName == 'updatefeedback') {
        updatefeedback.updatefeedback(client,event, function (response) {
            callback( response)
        });
    }
    else {
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback( data)
    }
};
module.exports = methods;