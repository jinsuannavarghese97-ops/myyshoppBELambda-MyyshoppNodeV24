const getItemDetailsById = require('./getItemDetailsById.js');
const getSimilarItemsById = require('./getSimilarItemsById.js');
const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    if(event.functionName == 'getItemDetailsById'){
        console.log("getItemDetailsById ............")
        getItemDetailsById.getItemDetailsById(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'getSimilarItemsById'){
        getSimilarItemsById.getSimilarItemsById(client,jsonObj,event, function(resultData){
            callback(resultData);
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