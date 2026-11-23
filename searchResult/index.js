let searchResultItemListing = require('./searchResultItemListing.js');

const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    
    if(event.functionName == 'searchResultItemListing'){
        jsonObj.storeId = event.storeId;
        jsonObj.offset = event.offset;
        jsonObj.max = event.max;
        searchResultItemListing.searchResultItemListing(client,jsonObj,event, function(response){
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
        callback(data)
    }
};
module.exports = methods;
