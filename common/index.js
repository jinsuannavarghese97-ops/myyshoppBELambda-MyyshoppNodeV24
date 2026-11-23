let getStoreData = require('./getStoreData.js');
let getLocationAndCategoryData = require('./getLocationAndCategoryData.js');
let getEasypayDetails = require('./getEasypayDetails.js');
let getStoreDataWithStoreId = require('./getStoreDataWithStoreId.js');
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