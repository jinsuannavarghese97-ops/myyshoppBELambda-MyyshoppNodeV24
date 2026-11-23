let queryExecution = require('../queryExecution');
const configuration = require('./configuration.js');
const paymentDetails = require('./paymentDetails.js');
const saveDeviceToken = require('./saveDeviceToken.js');
const trackOrder = require('./trackOrder.js');
const sort = require('./sort.js');
const footerData = require('./footerData.js');
const bundleDetails = require('./bundleDetails.js');
const pushNotification = require('./pushNotification/pushNotification');
const unsuscribePush = require('./pushNotification/unsuscribePush');
const storeView = require('./storeView');
const isGlobal = require('./isGlobal');

const mysql = require('mysql');
const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    if (event.functionName == 'configuration') {
        configuration.configuration(client,jsonObj,event, function (result) {
            callback(result)
        })
    }
    else if (event.functionName == 's3configuration') {
        configuration.s3configuration(client,jsonObj,event, function (result) {
            callback(result)
        })
    }
    else if (event.functionName == 'paymentDetails') {
        jsonObj.storeId = event.storeId;
        paymentDetails.paymentDetails(client,jsonObj,event, function (result) {
            callback(result)
        })
    }
    else if (event.functionName == 'trackOrder') {
        console.log("event ",event)
        jsonObj.orderId = event.orderId;

        trackOrder.trackOrder(client,jsonObj,event, function (response) {
            const data = {
                success: "1",
                result: {
                    "trackOrder": response
                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(data)
        });
    }
    else if (event.functionName == 'saveDeviceToken') {

        jsonObj.bundleId = event.bundleId;
        jsonObj.deviceId = event.deviceId;
        jsonObj.notificationTypeId = event.notificationTypeId;
        jsonObj.userId = event.userId;
        jsonObj.deviceTypeId = event.deviceTypeId;
        jsonObj.deviceToken = event.deviceToken;
        saveDeviceToken.saveDeviceToken(client,jsonObj,event, function (result) {
            callback( result)
        })
    }
    else if (event.functionName == 'sort') {
       
        sort.sort(client,jsonObj,event, function (result) {
            const data = {
                success: "1",
                result: {
                    "sortList": result

                },
                errorMessage: "",
                successMessage: "Filters fetched successfully"
            };
            callback(data)
        })
    }
    else if(event.functionName == 'footerData'){
         //console.log("footerData..")
        jsonObj.sellerId = event.sellerId
       
         footerData.footerData(client,jsonObj,event, function(finalDataSet){
             callback(finalDataSet)
         });
     }
      else if(event.functionName == 'bundleDetails'){
        jsonObj.bundleId = event.bundleId
        bundleDetails.bundleDetails(client,jsonObj,event, function(finalDataSet){
            callback(finalDataSet)
        });
     }
    else if(event.functionName == 'pushNotification'){
        pushNotification.pushNotification(client,jsonObj,event, function(finalDataSet){
            callback(finalDataSet)
        });
     }
    else if(event.functionName == 'unsuscribePush'){
        unsuscribePush.unsuscribePush(client,jsonObj,event, function(finalDataSet){
            callback(finalDataSet)
        });
    }
    else if(event.functionName == 'storeView'){
        storeView.storeView(client,event,jsonObj, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'isGlobal'){
        isGlobal.isGlobal(client,event,jsonObj, function(response){
            callback(response)
        });
    } 
   
    else {
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback(data)
    }

};
module.exports = methods;