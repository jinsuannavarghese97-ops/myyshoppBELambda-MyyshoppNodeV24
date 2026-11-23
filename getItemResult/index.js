let getPopularItem = require('./getPopularItem.js');
let saveMore = require('./saveMore.js');
const restaurantItem = require('./restaurantItem');
const groceryItem = require('./groceryItem');
const commonItem = require('./commonItem');
const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    if(event.functionName == 'getPopularItem'){
        jsonObj.storeId = event.storeId;
        jsonObj.selectedProduct = event.selectedProduct
        
        jsonObj.offset = event.offset;
        jsonObj.max = event.max;
        getPopularItem.getPopularItem(jsonObj,event, function(response,storeResults){
            
            const data = {
                success: "1",
                result: {
                    "itemResult": response, 
                    "storeResults":storeResults
                    
                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(data);
        });
    }
    else if(event.functionName == 'saveMore'){
        jsonObj.sisId = event.sisId;
        jsonObj.itemPrice = event.itemPrice;
        jsonObj.unit = event.unit;
        jsonObj.itemId = event.itemId;
        jsonObj.cityId = event.cityId;
        jsonObj.storeId = event.storeId;
        jsonObj.itemName =event.itemName;
        jsonObj.selectedProduct = event.selectedProduct
        saveMore.saveMore(client,jsonObj,event, function(itemData,swapItemData){
            
            const data = {
                success: "1",
                result: {
                     "itemData":itemData,
                     "swapItemData": swapItemData
                },
                errorMessage: "",
                successMessage: "Success"
            };
            //console.log("itemData",data.result.itemData)
            // console.log("swapItemData",data.result.swapItemData)
            callback(data);
        });
    }
    else if(event.functionName == 'restaurantItem'){
        restaurantItem.restaurantItem(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'groceryItem'){
        groceryItem.groceryItem(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'commonItem'){
        commonItem.commonItem(client,jsonObj,event, function(response){
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