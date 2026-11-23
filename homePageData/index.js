let AWS = require('aws-sdk');
let lambda = new AWS.Lambda();
let getCityDetails = require('./getCityDetails.js')
let getLocationDetails = require('./getLocationDetails.js')
let getTopLocations = require('./getTopLocations.js')
let getStoreDetails = require('./getStoreDetails.js')
let categoryData = require('./categoryData.js')
let banner = require('./banner.js')
const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    
    if(event.functionName == 'getCityDetails'){
        let cityParams = {
            cityKeyWord:event.cityKeyWord,
            sellerId:event.sellerId
        }
        getCityDetails.getCityDetails(client,jsonObj,event,cityParams, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'getLocationDetails'){
        let locationParams = {
            locationKeyWord:event.locationKeyWord,
            sellerId:event.sellerId,
            cityId:event.cityId
        }
        getLocationDetails.getLocationDetails(client,jsonObj,event,locationParams, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'getTopLocations'){
        //let storeId = event.storeId
        jsonObj.sellerId = event.sellerId
        getTopLocations.getTopLocations(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'getStoreDetails'){
        let storeId = event.storeId
        jsonObj.storeId = event.storeId
        getStoreDetails.getStoreDetails(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'banner'){
        let storeId = event.storeId
        jsonObj.storeId = event.storeId
         jsonObj.bannerType = event.bannerType
        banner.banner(client,jsonObj,event, function(response){
            callback(response);
        });
    }
     else if(event.functionName == 'categoryData'){
        let storeId = event.storeId
        jsonObj.storeId = event.storeId
        categoryData.categoryData(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else{
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback(data);
    }
};
module.exports = methods;