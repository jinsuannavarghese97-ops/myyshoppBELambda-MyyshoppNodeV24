const getDeliveryAddressListDetails = require('./getDeliveryAddressList.js');
const checkExpressDeliveryDetails = require('./checkExpressDelivery.js');
const getDeliverySlotDetails = require('./getDeliverySlots.js');
const deleteDeliveryAddressDetails = require('./deleteDeliveryAddress.js');
const getCheckOutItemDetails = require('./getCheckOutItemDetails.js');
const saveBuyerDeliveryAddress = require('./saveBuyerDeliveryAddress.js');
const getStoreServingLocations = require('./getStoreServingLocations.js');
const getPaymentOptions = require('./getPaymentOptions.js');
const getStoreDetails = require('./getStoreDetails.js');
const cancelOrder =  require('./cancelOrder.js');
const getCmDeliverySlot = require('./getCmDeliverySlot');
const razorpay = require('./razorpay');
const worldLine = require('./worldLine');
const easyPay = require('./easyPay');
const paymentCredentials = require('./paymentCredentials');
const worldLineStatus = require('./worldLineStatus');
const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    if(event.functionName == 'checkExpressDelivery'){
        checkExpressDeliveryDetails.expressDelivery(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'getDeliveryAddressList'){
        getDeliveryAddressListDetails.getDeliveryAddressList(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'getDeliverySlots'){
        getDeliverySlotDetails.getDeliverySlot(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'getPaymentOptions'){
        getPaymentOptions.getPaymentOptions(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'deleteDeliveryAddress'){
        deleteDeliveryAddressDetails.deleteDeliveryAddress(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'getCheckOutItemDetails'){
        getCheckOutItemDetails.getCheckOutItemDetailsList(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'saveBuyerDeliveryAddress'){
        saveBuyerDeliveryAddress.saveBuyerDeliveryAddress(client,jsonObj,event, function(response){
            callback(response);
        });
    }
     else if(event.functionName == 'getStoreDetails'){
        getStoreDetails.getStoreDetails(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'getStoreServingLocations'){
        getStoreServingLocations.getStoreServingLocations(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'cancelOrder'){
        cancelOrder.cancelOrder(client,jsonObj,event, function(response){
         //   console.log("response....",response)
           callback(response);
           
        });
    }
    else if(event.functionName == 'getCmDeliverySlot'){
        getCmDeliverySlot.getCmDeliverySlot(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'razorpay'){
        razorpay.razorpay(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'worldLine'){
        worldLine.worldLine(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'easyPay'){
        easyPay.easyPay(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'paymentCredentials'){
        paymentCredentials.paymentCredentials(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'worldLineStatus'){
        worldLineStatus.worldLineStatus(client,jsonObj,event, function(response){
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