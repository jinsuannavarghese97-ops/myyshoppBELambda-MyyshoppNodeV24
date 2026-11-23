const mysql = require('mysql');
const checkPromoCode = require('./checkPromoCode.js')

const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    if(event.functionName == 'listPromoCode'){
        jsonObj.storeId = event.storeId;
        jsonObj.promoCode = event.promoCode;
        jsonObj.userId = event.userId
        jsonObj.isApp = event.isApp
        jsonObj.totalAmount = event.totalAmount
        jsonObj.type="list"
        jsonObj.myCategoryId = event.myCategoryId
        jsonObj.siteCategoryGroupStores = event.siteCategoryGroupStores
        checkPromoCode.listPromoCode(client,jsonObj,event, function(result){
             callback(result)
        });
    }
    else{
        const data = {
            success: "0",
            result:[],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback(data);
    }
};
module.exports = methods;
