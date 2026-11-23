const methods = {};
const sellerItemImportHistory = require('./sellerItemImportHistory');
const grocerySellerList = require('./grocerySellerList');
const mappedList = require('./mappedList');
const notMappedList = require('./notMappedList');
const completelyMatched = require('./completelyMatched');
const itemListing = require('./itemListing');

methods.index = function(client,jsonObj,event,callback) {
    if(event.functionName.toLowerCase() == 'sellerItemImportHistory'.toLowerCase()){
        sellerItemImportHistory.getFiles(client,jsonObj,event, function(response){
             callback(response)
        });
    }
    else if(event.functionName.toLowerCase() == 'getGrocerySellerAndStore'.toLowerCase()){
        grocerySellerList.getGrocerySellerAndStore(client,jsonObj,event, function(response){
             callback(response)
        });
    }
    else if(event.functionName.toLowerCase() == 'mappedList'.toLowerCase()){
        mappedList.mappedList(client,jsonObj,event, function(response){
             callback(response)
        });
    }
    else if(event.functionName.toLowerCase() == 'notMappedList'.toLowerCase()){
        notMappedList.notMappedList(client,jsonObj,event, function(response){
             callback(response)
        });
    }
    else if(event.functionName.toLowerCase() == 'completelyMatched'.toLowerCase()){
        completelyMatched.completelyMatched(client,jsonObj,event, function(response){
             callback(response)
        });
    }
    else if(event.functionName.toLowerCase() == 'itemListing'.toLowerCase()){
        itemListing.itemListing(client,jsonObj,event, function(response){
             callback(response)
        });
    }
    else if(event.functionName.toLowerCase() == 'statusChange'.toLowerCase()){
        itemListing.statusChange(client,jsonObj,event, function(response){
             callback(response)
        });
    }
    else{
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback(null,data)
    }
};
module.exports = methods;